/**
 * Browser-side upload to /api/upload, shared by every admin uploader.
 *
 * Uses XMLHttpRequest rather than fetch because only XHR reports upload
 * progress — which matters for videos.
 */

export type UploadedFile = { url: string; key: string; size: number; kind: string; name: string };

export function uploadFile(file: File, folder: string, onProgress?: (percent: number) => void) {
  return new Promise<UploadedFile>((resolve, reject) => {
    const body = new FormData();
    body.append("file", file);
    body.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      let data: { ok?: boolean; url?: string; key?: string; size?: number; kind?: string; error?: string } = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* keep the status code */
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.ok && data.url) {
        resolve({ url: data.url, key: data.key ?? "", size: data.size ?? file.size, kind: data.kind ?? "IMAGE", name: file.name });
      } else {
        reject(new Error(data.error ?? String(xhr.status)));
      }
    };
    xhr.onerror = () => reject(new Error("网络错误"));
    xhr.send(body);
  });
}
