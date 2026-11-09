import { describe, expect, it } from "vitest";
import { resolveImg } from "@/lib/images";

describe("resolveImg (photos must work on any host, e.g. Vercel)", () => {
  it("swaps an old hosted photo address for the photo shipped with the site", () => {
    const out = resolveImg("/__l5e/assets-v1/91d157ea-7e09-4232-93a2-e449cd9ed50a/service-hvac.webp", "fallback");
    expect(out).not.toContain("__l5e");
    expect(out).toContain("service-hvac");
  });

  it("uses the fallback when an old address names a photo the site does not ship", () => {
    expect(resolveImg("/__l5e/assets-v1/abc/missing.webp", "fallback")).toBe("fallback");
  });

  it("keeps uploaded photo links unchanged", () => {
    const signed = "https://x.supabase.co/storage/v1/object/sign/site-images/a.webp?token=t";
    expect(resolveImg(signed, "fallback")).toBe(signed);
  });

  it("uses the fallback when nothing is saved", () => {
    expect(resolveImg("", "fallback")).toBe("fallback");
  });
});
