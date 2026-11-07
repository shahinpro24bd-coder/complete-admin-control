import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { adminSetupStatus, ensureAdminAccount } from "@/lib/cms.functions";
import { usernameToEmail } from "@/lib/cms";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Sign In | QMEP Electromechanical LLC" },
      { name: "description", content: "Sign in to manage the QMEP website content." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Sign In | QMEP" },
      { property: "og:description", content: "QMEP website admin panel sign in." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [setup, setSetup] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    adminSetupStatus().then((r) => setSetup(r.needsSetup)).catch(() => setSetup(false));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      if (setup) {
        if (password.length < 8) throw new Error("Password must be at least 8 characters.");
        if (password !== password2) throw new Error("Passwords do not match.");
        const r = await ensureAdminAccount({ data: { password } });
        if (!r.created) throw new Error(r.error ?? "Could not create the admin account.");
        const { error } = await supabase.auth.signInWithPassword({ email: usernameToEmail("admin"), password });
        if (error) throw new Error("Account created — please sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: usernameToEmail(username), password });
        if (error) throw new Error("Wrong username or password.");
      }
      nav({ to: "/admin", replace: true });
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  if (setup === null) return <div className="p-5 text-center">Loading…</div>;

  return (
    <div className="d-flex align-items-center justify-content-center bg-light" style={{ minHeight: "100vh", padding: 16 }}>
      <form onSubmit={submit} className="bg-white shadow p-5" style={{ width: "100%", maxWidth: 420, borderTop: "4px solid var(--primary)" }}>
        <h1 className="display-6 mb-1">QMEP Admin</h1>
        {setup ? (
          <>
            <p className="text-muted mb-4">First-time setup: choose the password for your <strong>admin</strong> account. You'll sign in with username <strong>admin</strong> and this password.</p>
            <label className="form-label">New password</label>
            <input type="password" className="form-control mb-3" style={{ height: 50 }} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
            <label className="form-label">Repeat password</label>
            <input type="password" className="form-control mb-3" style={{ height: 50 }} value={password2} onChange={(e) => setPassword2(e.target.value)} required minLength={8} autoComplete="new-password" />
          </>
        ) : (
          <>
            <p className="text-muted mb-4">Sign in to edit your website.</p>
            <label className="form-label">Username</label>
            <input className="form-control mb-3" style={{ height: 50 }} value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
            <label className="form-label">Password</label>
            <input type="password" className="form-control mb-3" style={{ height: 50 }} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </>
        )}
        {err && <p className="text-danger">{err}</p>}
        <button className="btn btn-primary w-100 py-3" disabled={busy}>{busy ? "Please wait…" : setup ? "Create admin account" : "Sign In"}</button>
        <a href="/" className="d-block text-center mt-3">← Back to website</a>
      </form>
    </div>
  );
}
