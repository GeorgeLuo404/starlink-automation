/**
 * B站 video links.
 *
 * Editors paste a normal watch link (www / m.bilibili.com/video/BV…, an old
 * av link, or the src of B站's own embed code). It is stored in that
 * canonical form and turned into a player URL only when a visitor clicks
 * play. b23.tv short links cannot be parsed offline; the admin action
 * resolves them on save (see resolveBilibiliShortLink).
 *
 * Pure functions — used by the admin form, the server action and the site.
 */

/** Exactly one of bvid / aid is set. */
export type BilibiliVideo = { bvid?: string; aid?: string; page: number };

const BVID_RE = /^BV[0-9A-Za-z]{10}$/;

function parse(url: string) {
  try {
    return new URL(url.trim());
  } catch {
    return null;
  }
}

function isHost(host: string, domain: string) {
  return host === domain || host.endsWith(`.${domain}`);
}

export function isBilibiliUrl(url: string) {
  const parsed = parse(url);
  return Boolean(parsed && (isHost(parsed.hostname, "bilibili.com") || isHost(parsed.hostname, "b23.tv")));
}

export function isBilibiliShortLink(url: string) {
  const parsed = parse(url);
  return Boolean(parsed && isHost(parsed.hostname, "b23.tv"));
}

export function parseBilibili(url: string): BilibiliVideo | null {
  const parsed = parse(url);
  if (!parsed || !isHost(parsed.hostname, "bilibili.com")) return null;

  const page = Math.max(1, Number.parseInt(parsed.searchParams.get("p") ?? parsed.searchParams.get("page") ?? "1", 10) || 1);

  // Embed code: player.bilibili.com/player.html?bvid=BV…&p=1
  const queryBvid = parsed.searchParams.get("bvid");
  if (queryBvid && BVID_RE.test(queryBvid)) return { bvid: queryBvid, page };
  const queryAid = parsed.searchParams.get("aid");
  if (queryAid && /^\d+$/.test(queryAid)) return { aid: queryAid, page };

  // Watch page: /video/BV1xx411c7mD/ or /video/av170001
  const match = parsed.pathname.match(/\/video\/(BV[0-9A-Za-z]{10}|av\d+)/i);
  if (!match) return null;
  const id = match[1];
  if (/^av/i.test(id)) return { aid: id.slice(2), page };
  return BVID_RE.test(id) ? { bvid: id, page } : null;
}

/** The watch-page link we store: https://www.bilibili.com/video/BV…[?p=2] */
export function canonicalBilibiliUrl(video: BilibiliVideo) {
  const id = video.bvid ?? `av${video.aid}`;
  return `https://www.bilibili.com/video/${id}${video.page > 1 ? `?p=${video.page}` : ""}`;
}

/** B站's embeddable player for a stored link; null when the link is not a B站 video. */
export function bilibiliEmbedUrl(url: string, { autoplay = true } = {}) {
  const video = parseBilibili(url);
  if (!video) return null;
  const params = new URLSearchParams({
    ...(video.bvid ? { bvid: video.bvid } : { aid: video.aid ?? "" }),
    p: String(video.page),
    autoplay: autoplay ? "1" : "0",
    danmaku: "0",
    high_quality: "1",
  });
  return `https://player.bilibili.com/player.html?${params}`;
}

/**
 * Follow a b23.tv short link to its watch page. Server-only (b23.tv sends no
 * CORS headers). Returns the canonical link, or null when it does not lead
 * to a B站 video.
 */
export async function resolveBilibiliShortLink(url: string) {
  try {
    const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(5000) });
    const location = response.headers.get("location");
    if (!location) return null;
    const video = parseBilibili(new URL(location, url).toString());
    return video ? canonicalBilibiliUrl(video) : null;
  } catch {
    return null;
  }
}
