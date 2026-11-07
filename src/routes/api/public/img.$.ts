import { createFileRoute } from "@tanstack/react-router";

// Serves uploaded site images from private storage through the site's own address.
export const Route = createFileRoute("/api/public/img/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat ?? "";
        if (!/^[\w.-]+$/.test(path)) return new Response("Not found", { status: 404 });
        let data: Blob | null = null;
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const res = await supabaseAdmin.storage.from("site-images").download(path);
          data = res.data;
        } catch {
          // Service key unavailable (e.g. static hosting without env vars).
          return new Response("Not found", { status: 404 });
        }
        if (!data) return new Response("Not found", { status: 404 });
        return new Response(data, {
          headers: {
            "content-type": data.type || "image/webp",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
