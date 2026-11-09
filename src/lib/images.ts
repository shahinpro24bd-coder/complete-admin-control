// Every photo that ships with the website (logo, banners, service photos).
const bundled = import.meta.glob("../assets/*.{webp,jpg,jpeg,png}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const byName: Record<string, string> = Object.fromEntries(Object.entries(bundled).map(([p, u]) => [p.split("/").pop()!, u]));

export const bundledImages = Object.values(bundled);

/**
 * Turns a saved image address into one that works on any host. Older saved content can hold
 * addresses that only worked on the previous hosting ("/__l5e/assets-v1/<id>/<file>" or
 * "/assets/<file>"); those are swapped for the photo of the same name shipped with the site.
 */
export function resolveImg(v: string | undefined | null, d: string): string {
  if (!v) return d;
  const m = v.match(/^\/(?:__l5e\/assets-v1\/[^/]+|assets)\/([^/?#]+)/);
  if (m) return byName[m[1]!] ?? d;
  return v;
}
