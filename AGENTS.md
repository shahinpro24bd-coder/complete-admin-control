<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Editable site content lives in the site_content table (keys company, services, faqs, texts) and is merged into the shared data in src/lib/site.ts by applyContent() in the root route; bundled values stay as fallback so the site works with an empty database.
- Every public page body lives in src/components/site/pages (or HomeContent) so the route and the admin page editor (/admin/pages/$page) render the same component; wrap text in `<T k d>`, images in `<Img k d>`, icons in `<Icon k d>` from src/lib/editable.tsx — no hard-coded visible copy, so admins can edit everything.
- Repeating content (cards, steps, bullets) uses `useList(key, defaults)` with `ItemTools`/`AddItem`; item keys are `${key}.${id}.field` and order/existence is stored as JSON under `${key}.__ids`, which keeps old index keys valid.
- Keys `services.N.*`, `faqs.N.*` and `company.<field>` (Contact Info, rendered with `<Co f>`) map to the shared services/faqs/company data (services list order decides which service pages exist, via mergeServices); all other keys live in the `texts` row. SEO overrides are `seo.<page>.title|description`, read in head() from the root loader data.
- Admin access is the `admin` role in user_roles (has_role RLS). The first admin is created by a one-time setup on /auth (owner picks the password); the owner chose their own credentials, so do not change them unasked.
- The site is also hosted outside Lovable (Vercel), so bundled photos live as real files in src/assets (no .asset.json CDN pointers) and every saved image value goes through resolveImg() in src/lib/images.ts, which maps old hosted addresses to the bundled file.
- Uploaded images go to the private site-images bucket (public buckets are blocked by the workspace); uploadSiteImage() stores a 10-year signed storage link so photos show on any host. /api/public/img/* stays only for older saved values.
- Server code must not rely on process.env alone for public backend settings: fall back to import.meta.env.VITE_* because hosts like Vercel do not load .env at runtime.
- No Lovable branding on the site: favicon/apple-touch icon are cut from the QMEP logo's Q mark.
- Full-width section bands use the `.band` class with content inside `.container` (1.5rem inline gutter) to avoid sideways scrolling on phones.
- The admin's only business module is Invoices (src/components/admin/Billing.tsx: invoice editor, Receive payment, printing, invoice settings; helpers in shared.tsx); customers/AMC/jobs/quotations/expenses/accounts screens were removed at the owner's request, their tables are kept unused so old data is not lost. Money math is pure in src/lib/business.ts with tests.
- Invoice status (unpaid/partial/paid) is derived from rows in payments and written back by syncInvoice() after any payment change; only "cancelled" is set by hand. invoices.amount stores the taxable amount (after discount), items holds the line items.
- src/test/editable-coverage.test.tsx renders every page in edit mode and fails on any visible text, icon or photo that is not editable; run it after touching page markup (only arrow/toggle icons and brand logos may stay fixed).
