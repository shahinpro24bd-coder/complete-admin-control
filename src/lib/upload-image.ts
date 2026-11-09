import { supabase } from "@/integrations/supabase/client";

// Ten years: the link must keep working for as long as the photo stays on the site.
const LINK_LIFETIME = 60 * 60 * 24 * 365 * 10;

/**
 * Uploads a site photo and returns a direct link to it. The link points straight at file
 * storage, so the photo shows on any host (not only where the site's own server runs).
 */
export async function uploadSiteImage(file: File, baseName: string): Promise<{ url?: string; error?: string }> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `${baseName.replace(/[^\w-]/g, "-")}-${Date.now()}.${ext}`;
  const up = await supabase.storage.from("site-images").upload(name, file, { contentType: file.type, cacheControl: "31536000" });
  if (up.error) return { error: up.error.message };
  const signed = await supabase.storage.from("site-images").createSignedUrl(name, LINK_LIFETIME);
  // Fall back to the site's own image address if a direct link could not be made.
  return { url: signed.data?.signedUrl ?? `/api/public/img/${name}` };
}
