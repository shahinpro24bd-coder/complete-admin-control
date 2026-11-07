import { createContext, useContext, type ImgHTMLAttributes, type ReactNode } from "react";

// Saved page texts/images keyed by field id (e.g. "home.hero.0.title"); filled by applyContent().
export const pageTexts: Record<string, string> = {};
export function setPageTexts(v?: Record<string, string> | null) {
  for (const k of Object.keys(pageTexts)) delete pageTexts[k];
  Object.assign(pageTexts, v ?? {});
}

type FaqOps = { add: () => void; remove: (i: number) => void; move: (i: number, dir: -1 | 1) => void };

type Ctx = {
  edit: boolean;
  get: (k: string, d: string) => string;
  set: (k: string, v: string) => void;
  pick: (k: string) => void;
  pickIcon?: (k: string) => void;
  faq?: FaqOps;
};

const viewCtx: Ctx = { edit: false, get: (k, d) => pageTexts[k] ?? d, set() {}, pick() {} };
export const EditContext = createContext<Ctx>(viewCtx);
export const useEditable = () => useContext(EditContext);

/** Reads an editable value (for attributes like links, placeholders, alt text). */
export function useText(k: string | undefined, d: string) {
  const c = useEditable();
  return k ? c.get(k, d) : d;
}

const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();

/** Text that becomes a textbox in the admin page editor. `line` = single-line input. */
export function T({ k, d, line }: { k?: string | undefined; d: string; line?: boolean }) {
  const c = useEditable();
  if (!k) return <>{d}</>;
  const v = c.get(k, d);
  if (!c.edit) return <>{v}</>;
  return line ? (
    <input className="cms-field cms-line" value={v} size={Math.max(3, v.length + 1)}
      onChange={(e) => c.set(k, e.target.value)} onClick={stop} onKeyDown={stop} onKeyUp={(e) => e.preventDefault()} />
  ) : (
    <textarea className="cms-field" value={v} rows={1}
      onChange={(e) => c.set(k, e.target.value)} onClick={stop} onKeyDown={stop} onKeyUp={(e) => e.preventDefault()} />
  );
}

export const safeImg = (v: string | undefined, d: string) => (v && !v.startsWith("/assets/") ? v : d);

/** Image that can be clicked to replace in the admin page editor. */
export function Img({ k, d, className, ...rest }: { k: string; d: string } & ImgHTMLAttributes<HTMLImageElement>) {
  const c = useEditable();
  return (
    <img {...rest} src={safeImg(c.get(k, d), d)}
      className={c.edit ? `${className ?? ""} cms-img` : className}
      title={c.edit ? "Click to change image" : rest.title}
      onClick={c.edit ? (e) => { e.preventDefault(); e.stopPropagation(); c.pick(k); } : rest.onClick} />
  );
}

/** Font Awesome icon that can be swapped from the admin page editor. */
export function Icon({ k, d, className = "", brand }: { k?: string | undefined; d: string; className?: string; brand?: boolean }) {
  const c = useEditable();
  const v = k ? c.get(k, d) : d;
  const cls = `${brand ? "fab" : "fa"} ${v} ${className}`.trim();
  if (!c.edit || !k || !c.pickIcon) return <i className={cls}></i>;
  return (
    <i className={`${cls} cms-icon`} title="Click to change icon" role="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); c.pickIcon!(k); }}></i>
  );
}

/** Editable link address: in the editor shows a small "link" chip to change where it points. */
export function useHref(k: string | undefined, d: string) {
  return useText(k ? `${k}.href` : undefined, d);
}

export type List<D> = {
  k: string;
  ids: number[];
  def: (id: number) => D;
  add: () => void;
  remove: (id: number) => void;
  move: (id: number, dir: -1 | 1) => void;
  edit: boolean;
};

/**
 * Editable list of items (cards, steps, bullet points...). Item fields keep their keys as
 * `${k}.${id}.field`; the order/which items exist is saved under `${k}.__ids`.
 * New items start as a copy of the last default item so the admin has something to edit.
 */
export function useList<D>(k: string, defaults: D[]): List<D> {
  const c = useEditable();
  const fallback = defaults.map((_, i) => i);
  let ids = fallback;
  const raw = c.get(`${k}.__ids`, "");
  if (raw) {
    try {
      const p = JSON.parse(raw);
      if (Array.isArray(p) && p.every((x) => Number.isInteger(x))) ids = p;
    } catch { /* keep defaults */ }
  }
  const save = (next: number[]) => c.set(`${k}.__ids`, JSON.stringify(next));
  return {
    k,
    ids,
    edit: c.edit,
    def: (id) => defaults[id] ?? defaults[defaults.length - 1]!,
    add: () => save([...ids, Math.max(defaults.length - 1, ...ids) + 1]),
    remove: (id) => save(ids.filter((x) => x !== id)),
    move: (id, dir) => {
      const i = ids.indexOf(id), j = i + dir;
      if (i < 0 || j < 0 || j >= ids.length) return;
      const next = [...ids];
      [next[i], next[j]] = [next[j]!, next[i]!];
      save(next);
    },
  };
}

/** Small move/delete toolbar shown on a list item in the editor. */
export function ItemTools({ list, id }: { list: Pick<List<unknown>, "edit" | "remove" | "move">; id: number }) {
  if (!list.edit) return null;
  const btn = (fn: () => void) => (e: { preventDefault: () => void; stopPropagation: () => void }) => { e.preventDefault(); e.stopPropagation(); fn(); };
  return (
    <span className="cms-tools" onClick={stop}>
      <button type="button" title="Move earlier" onClick={btn(() => list.move(id, -1))}><i className="fa fa-arrow-up"></i></button>
      <button type="button" title="Move later" onClick={btn(() => list.move(id, 1))}><i className="fa fa-arrow-down"></i></button>
      <button type="button" title="Remove" className="is-danger" onClick={btn(() => { if (confirm("Remove this item?")) list.remove(id); })}><i className="fa fa-trash"></i></button>
    </span>
  );
}

/** "Add" button shown after a list in the editor. */
export function AddItem({ list, label = "Add item", wrap }: { list: Pick<List<unknown>, "edit" | "add">; label?: string; wrap?: (n: ReactNode) => ReactNode }) {
  if (!list.edit) return null;
  const b = (
    <button type="button" className="cms-add" onClick={(e) => { e.preventDefault(); e.stopPropagation(); list.add(); }}>
      <i className="fa fa-plus me-2"></i>{label}
    </button>
  );
  return <>{wrap ? wrap(b) : b}</>;
}
