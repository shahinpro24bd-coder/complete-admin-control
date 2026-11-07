import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { EditContext, useList } from "@/lib/editable";
import { mergeServices, makeSlug, defaults } from "@/lib/cms";

function ListProbe({ store }: { store: Record<string, string> }) {
  const l = useList("why", ["a", "b", "c"]);
  return <>{l.ids.map((id) => l.def(id)).join(",")}</>;
}
const render = (store: Record<string, string>) =>
  renderToString(
    <EditContext.Provider value={{ edit: false, get: (k, d) => store[k] ?? d, set() {}, pick() {} }}>
      <ListProbe store={store} />
    </EditContext.Provider>,
  );

describe("editable lists", () => {
  it("shows every default item when nothing is saved", () => {
    expect(render({})).toBe("a,b,c");
  });
  it("hides removed items and keeps the saved order", () => {
    expect(render({ "why.__ids": "[2,0]" })).toBe("c,a");
  });
  it("new items start as a copy of the last default item", () => {
    expect(render({ "why.__ids": "[0,1,2,3]" })).toBe("a,b,c,c");
  });
  it("can be emptied completely", () => {
    expect(render({ "why.__ids": "[]" })).toBe("");
  });
});

describe("services from the admin panel", () => {
  it("removing a service removes it from the site list", () => {
    const saved = defaults.services.filter((s) => s.slug !== "vrf");
    expect(mergeServices(saved).map((s) => s.slug)).not.toContain("vrf");
    expect(mergeServices(saved)).toHaveLength(defaults.services.length - 1);
  });
  it("an added service appears with its own page id", () => {
    const slug = makeSlug("Fire Fighting", defaults.services.map((s) => s.slug));
    expect(slug).toBe("fire-fighting");
    const list = mergeServices([...defaults.services, { slug, title: "Fire Fighting", summary: "x", items: ["y"], cta: "Go", image: "", icon: "fa-fire" }]);
    expect(list.at(-1)).toMatchObject({ slug: "fire-fighting", title: "Fire Fighting", icon: "fa-fire" });
  });
  it("an empty saved list falls back to the bundled services", () => {
    expect(mergeServices([])).toHaveLength(defaults.services.length);
  });
});
