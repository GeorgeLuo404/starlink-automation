import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";

/**
 * Pluggable object storage.
 *
 * - "local"  : writes into ./public/uploads — perfect for development and for a
 *              single Aliyun ECS box that serves its own assets.
 * - "s3"     : any S3-compatible endpoint, including Aliyun OSS (S3 API),
 *              Tencent COS, MinIO or AWS S3. Switch with STORAGE_DRIVER=s3.
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

/** Build a safe, collision-free object key: 2026/02/uuid-name.ext */
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

export function publicUrlFor(key: string) {
  if (storageDriver() === "s3") {
    const base = (process.env.S3_PUBLIC_BASE_URL || "").replace(/\/$/, "");
    if (!base) throw new Error("S3_PUBLIC_BASE_URL must be set when STORAGE_DRIVER=s3");
    return `${base}/${key}`;
  }
  return `/uploads/${key}`;
}

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

export async function getObject(key: string): Promise<{ body: Buffer; contentType?: string } | null> {
  if (storageDriver() === "s3") return getS3(key);
  try {
    const target = path.join(/* turbopackIgnore: true */ localStorageRoot(), key);
    const body = await readFile(target);
    return { body };
  } catch {
    return null;
  }
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
  });
  return { mod, client, bucket: process.env.S3_BUCKET || "" };
}

async function putS3(key: string, body: Buffer, contentType: string) {
  const { mod, client, bucket } = await s3();
  await client.send(
    new mod.PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType })
  );
  return { url: publicUrlFor(key), key };
}

async function deleteS3(key: string) {
  const { mod, client, bucket } = await s3();
  await client.send(new mod.DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

async function getS3(key: string) {
  const { mod, client, bucket } = await s3();
  const res = await client.send(new mod.GetObjectCommand({ Bucket: bucket, Key: key }));
  if (!res.Body) return null;
  const bytes = await res.Body.transformToByteArray();
  return { body: Buffer.from(bytes), contentType: res.ContentType };
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

export function isAllowedType(mimeType: string, max = 200) {
  const allowed = [...IMAGE_TYPES, ...VIDEO_TYPES, ...DOC_TYPES];
  void max;
  return allowed.includes(mimeType) || mimeType.startsWith("video/") || mimeType.startsWith("image/");
}
