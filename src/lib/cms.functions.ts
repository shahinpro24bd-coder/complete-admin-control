import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { SiteContent } from "@/lib/cms";

// Public read of the editable site content (site_content allows anonymous reads).
export const getSiteContent = createServerFn({ method: "GET" }).handler(async (): Promise<SiteContent> => {
  try {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    const url = process.env["SUPABASE_URL"];
    if (!key || !url) return {};
    const sb = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const { data } = await sb.from("site_content").select("key, value");
    const out: Record<string, unknown> = {};
    for (const r of data ?? []) out[r.key] = r.value;
    return out as SiteContent;
  } catch {
    return {};
  }
});

// True while no admin account exists yet (first-time setup).
export const adminSetupStatus = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin");
    return { needsSetup: (count ?? 0) === 0 };
  } catch {
    return { needsSetup: false };
  }
});

// Creates the "admin" account with the owner's chosen password — only while no admin exists yet.
export const ensureAdminAccount = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => {
    if (typeof d?.password !== "string" || d.password.length < 8 || d.password.length > 72) throw new Error("Password must be 8–72 characters.");
    return { password: d.password };
  })
  .handler(async ({ data: input }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin");
    if ((count ?? 0) > 0) return { created: false, error: "An admin account already exists." };
    let userId: string | undefined;
    const { data, error } = await supabaseAdmin.auth.admin.createUser({ email: "admin@qmep-app.com", password: input.password, email_confirm: true });
    if (error) {
      if (error.code === "weak_password" || /weak|guess|pwned/i.test(error.message)) return { created: false, error: "That password is too easy to guess. Please choose a stronger one." };
      const list = await supabaseAdmin.auth.admin.listUsers();
      userId = list.data.users.find((u) => u.email === "admin@qmep-app.com")?.id;
      if (!userId) return { created: false, error: "Could not create the admin account." };
      const upd = await supabaseAdmin.auth.admin.updateUserById(userId, { password: input.password });
      if (upd.error) return { created: false, error: "That password is too easy to guess. Please choose a stronger one." };
    } else {
      userId = data.user?.id;
    }
    if (!userId) return { created: false, error: "Could not create the admin account." };
    const ins = await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (ins.error) return { created: false, error: "Could not give the account admin rights." };
    return { created: true, error: null };
  });
