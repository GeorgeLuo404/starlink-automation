import { mkdir, writeFile, unlink, stat } from "node:fs/promises";
import path from "node:path";

/**
 * Pluggable object storage.
 *
 * - "local" : writes into ./public/uploads — development, or a single ECS box
 *             whose nginx serves /uploads from the same volume.
 * - "s3"    : any S3-compatible bucket — Supabase Storage, Aliyun OSS, MinIO or
 *             AWS S3. Switch with STORAGE_DRIVER=s3.
 *
 * Either way a file's public URL is /uploads/<key> on the site's own domain.
 * With the s3 driver that path is proxied to the bucket (next.config.ts rewrite
 * on Vercel, nginx on ECS), so URLs saved in the database survive a change of
 * bucket and visitors never need to reach the storage host directly.
 */

export type StorageDriverName = "local" | "s3";

export function storageDriver(): StorageDriverName {
  return (process.env.STORAGE_DRIVER as StorageDriverName) || "local";
}

/**
 * Root directory for the local storage driver.
 *
 * Kept as a single expression so Turbopack's file-tracing analysis can see that
 * the base is statically scoped to ./public/uploads; STORAGE_LOCAL_DIR opts out
 * of that analysis explicitly (see the turbopackIgnore comments below).
 */
export function localStorageRoot() {
  return process.env.STORAGE_LOCAL_DIR || path.join(process.cwd(), "public", "uploads");
}

/** Build a safe, collision-free object key: folder/2026/02/rand-name.ext */
export function buildKey(originalName: string, folder = "general") {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const safe = originalName
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(-80) || "file";
  const rand = Math.random().toString(36).slice(2, 10);
  const cleanFolder = folder.replace(/[^\w/-]/g, "") || "general";
  return `${cleanFolder}/${yyyy}/${mm}/${rand}-${safe}`;
}

/** Folder part of a key made by buildKey: "gallery/2026/02/x-a.jpg" → "gallery". */
export function folderOfKey(key: string) {
  return key.split("/").slice(0, -3).join("/") || "general";
}

/** True for keys that buildKey could have produced — guards routes that accept a key. */
export function isValidKey(key: string) {
  return /^[\w-]+(\/[\w-]+)*\/\d{4}\/\d{2}\/[0-9a-z]+-[\w.-]+$/.test(key);
}

/** Same-origin public URL of a stored object, whichever driver is active. */
export function publicUrlFor(key: string) {
  return `/uploads/${key}`;
}

/** Upload size limit in bytes (MAX_UPLOAD_MB, default 200). */
export function maxUploadBytes() {
  return Number(process.env.MAX_UPLOAD_MB ?? 200) * 1024 * 1024;
}

/** Keys are unique per upload, so the bytes behind a URL never change. */
const IMMUTABLE = "public, max-age=31536000, immutable";

export async function putObject(key: string, body: Buffer, contentType: string) {
  if (storageDriver() === "s3") return putS3(key, body, contentType);
  return putLocal(key, body);
}

export async function deleteObject(key: string) {
  try {
    if (storageDriver() === "s3") return await deleteS3(key);
    const target = path.join(/* turbopackIgnore: true */ localStorageRoot(), key);
    await unlink(target);
  } catch {
    /* deleting a missing object is not an error */
  }
}

/** Size and content type of a stored object, or null when it does not exist. */
export async function statObject(key: string): Promise<{ size: number; contentType?: string } | null> {
  if (storageDriver() === "s3") return statS3(key);
  try {
    const target = path.join(/* turbopackIgnore: true */ localStorageRoot(), key);
    return { size: (await stat(target)).size };
  } catch {
    return null;
  }
}

/**
 * Presigned PUT so the browser uploads straight to the bucket (s3 driver only):
 * large files never pass through the server, whose request body Vercel caps at
 * 4.5 MB. The browser must send exactly `headers`; the signed Content-Length
 * pins the upload to the size that was validated.
 */
export async function presignUpload(key: string, contentType: string, size: number) {
  const { mod, client, bucket } = await s3();
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
  const command = new mod.PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    ContentLength: size,
    CacheControl: IMMUTABLE,
  });
  const url = await getSignedUrl(client, command, { expiresIn: 600 });
  return { url, headers: { "Content-Type": contentType, "Cache-Control": IMMUTABLE } };
}

/* ----------------------------- local driver ----------------------------- */

async function putLocal(key: string, body: Buffer) {
  const target = path.join(/* turbopackIgnore: true */ localStorageRoot(), key);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, body);
  return { url: publicUrlFor(key), key };
}

/* ------------------------------- s3 driver ------------------------------ */

type S3Module = typeof import("@aws-sdk/client-s3");

async function s3() {
  const mod = (await import("@aws-sdk/client-s3")) as S3Module;
  const { S3Client } = mod;
  const client = new S3Client({
    region: process.env.S3_REGION || "oss-cn-shenzhen",
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
    // The SDK adds CRC32 checksum headers by default, which S3-compatible stores
    // (OSS, Supabase) may reject and which break presigned PUTs. Only send them
    // when an operation requires it.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return { mod, client, bucket: process.env.S3_BUCKET || "" };
}

async function putS3(key: string, body: Buffer, contentType: string) {
  const { mod, client, bucket } = await s3();
  await client.send(
    new mod.PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType, CacheControl: IMMUTABLE })
  );
  return { url: publicUrlFor(key), key };
}

async function deleteS3(key: string) {
  const { mod, client, bucket } = await s3();
  await client.send(new mod.DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

async function statS3(key: string) {
  const { mod, client, bucket } = await s3();
  try {
    const res = await client.send(new mod.HeadObjectCommand({ Bucket: bucket, Key: key }));
    return { size: res.ContentLength ?? 0, contentType: res.ContentType };
  } catch {
    return null;
  }
}

/* ------------------------------- helpers -------------------------------- */

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"];
export const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
export const DOC_TYPES = [
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
];

export function mediaKindOf(mimeType: string): "IMAGE" | "VIDEO" | "DOCUMENT" {
  if (IMAGE_TYPES.includes(mimeType)) return "IMAGE";
  if (VIDEO_TYPES.includes(mimeType)) return "VIDEO";
  return "DOCUMENT";
}

export function isAllowedType(mimeType: string) {
  const allowed = [...IMAGE_TYPES, ...VIDEO_TYPES, ...DOC_TYPES];
  return allowed.includes(mimeType) || mimeType.startsWith("video/") || mimeType.startsWith("image/");
}
