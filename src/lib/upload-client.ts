/**
 * Browser-side upload, shared by every admin uploader.
 *
 * /api/upload/sign decides where the file goes. With the s3 driver it is PUT
 * straight to the bucket through a presigned URL (Vercel caps request bodies to
 * functions at 4.5 MB) and /api/upload/complete indexes it afterwards; with the
 * local driver it is posted to /api/upload.
 *
 * The file itself is sent with XMLHttpRequest rather than fetch because only
 * XHR reports upload progress — which matters for videos.
 */

export type UploadedFile = { url: string; key: string; size: number; kind: string; name: string };

type Reply = { ok?: boolean; error?: string; maxBytes?: number };
type SignReply = { mode: "form" } | { mode: "direct"; key: string; url: string; headers: Record<string, string> };
type AssetReply = { url: string; key: string; size: number; kind: string };

const MESSAGES: Record<string, string> = {
  unauthorized: "登录已过期，请刷新页面后重新登录",
  unsupported_type: "不支持该文件类型",
  storage_failed: "存储服务出错，请稍后重试",
  not_found: "文件没有写入存储，请重试",
};

function failure(reply: Reply, status: number) {
  if (reply.error === "file_too_large" && reply.maxBytes) {
    return new Error(`文件超过 ${Math.round(reply.maxBytes / 1024 / 1024)} MB 上限`);
  }
  return new Error((reply.error && MESSAGES[reply.error]) || reply.error || `HTTP ${status}`);
}

async function postJson<T>(url: string, payload: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("网络错误");
  }
  const reply = (await response.json().catch(() => ({}))) as Reply & T;
  if (!response.ok || !reply.ok) throw failure(reply, response.status);
  return reply;
}

/** Send the file with progress events; resolves with the HTTP status and raw body. */
function send(
  method: "PUT" | "POST",
  url: string,
  body: File | FormData,
  headers: Record<string, string>,
  onProgress?: (percent: number) => void
) {
  return new Promise<{ status: number; text: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    for (const [name, value] of Object.entries(headers)) xhr.setRequestHeader(name, value);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => resolve({ status: xhr.status, text: xhr.responseText });
    xhr.onerror = () => reject(new Error("网络错误"));
    xhr.send(body);
  });
}

export async function uploadFile(file: File, folder: string, onProgress?: (percent: number) => void): Promise<UploadedFile> {
  const type = file.type || "application/octet-stream";
  const plan = await postJson<SignReply>("/api/upload/sign", { name: file.name, type, size: file.size, folder });

  let asset: AssetReply;
  if (plan.mode === "direct") {
    const put = await send("PUT", plan.url, file, plan.headers, onProgress);
    if (put.status < 200 || put.status >= 300) throw new Error(`上传到存储失败（HTTP ${put.status}）`);
    asset = await postJson<AssetReply>("/api/upload/complete", { key: plan.key, name: file.name });
  } else {
    const body = new FormData();
    body.append("file", file);
    body.append("folder", folder);
    const { status, text } = await send("POST", "/api/upload", body, {}, onProgress);
    let reply: Reply & Partial<AssetReply> = {};
    try {
      reply = JSON.parse(text);
    } catch {
      /* keep the status code */
    }
    if (status < 200 || status >= 300 || !reply.ok || !reply.url) throw failure(reply, status);
    asset = reply as AssetReply;
  }

  return { url: asset.url, key: asset.key ?? "", size: asset.size ?? file.size, kind: asset.kind ?? "IMAGE", name: file.name };
}
