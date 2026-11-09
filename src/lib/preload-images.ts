// Warms the browser cache with every bundled site image right after the first page loads,
// so later pages and sliders show their pictures instantly.
import { bundledImages } from "@/lib/images";

export function preloadSiteImages(extra: string[] = []) {
  const urls = [...bundledImages, ...extra];
  const run = () => urls.forEach((u) => { const i = new Image(); i.decoding = "async"; i.src = u; });
  if ("requestIdleCallback" in window) (window as any).requestIdleCallback(run, { timeout: 800 });
  else setTimeout(run, 200);
}
