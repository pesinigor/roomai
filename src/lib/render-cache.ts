/**
 * In-memory render URL cache.
 * Survives Next.js SPA navigation but is cleared on hard page reload.
 * Avoids storing large base64 images in sessionStorage.
 */
const _cache: Record<string, string | undefined> = {};

export function setRenderCache(urls: Record<string, string | undefined>): void {
  for (const key of Object.keys(_cache)) delete _cache[key];
  Object.assign(_cache, urls);
}

export function getRenderCache(): Record<string, string | undefined> {
  return { ..._cache };
}

export function clearRenderCache(): void {
  for (const key of Object.keys(_cache)) delete _cache[key];
}
