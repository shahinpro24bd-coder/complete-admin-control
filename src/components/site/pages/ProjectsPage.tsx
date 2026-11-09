import { Link } from "@tanstack/react-router";
import { useState } from "react";
import hero3Asset from "@/assets/hero-3.webp.asset.json";
import { services } from "@/lib/site";
import { PageHeader, SectionTitle } from "@/components/site/Layout";
import { CtaBanner } from "@/components/site/Sections";
import { T, Img, Icon, useEditable, useList, ItemTools, AddItem } from "@/lib/editable";

const props = ["Villa / Residential", "Office / Commercial", "Residential Building", "Commercial Property", "Mixed-Use Building", "Commercial Tower"];

function Scope({ id, items }: { id: number; items: string[] }) {
  const list = useList(`projects.${id}.scope`, items);
  return (
    <div className="pj-scope">
      {list.ids.map((sid) => <span key={sid}><T k={`projects.${id}.scope.${sid}`} d={list.def(sid)} line />{list.edit && <ItemTools list={list} id={sid} />}</span>)}
      <AddItem list={list} label="Add" />
    </div>
  );
}

export function ProjectsPage() {
  const c = useEditable();
  // Default project cards are based on the services; admins can add, remove and rewrite them.
  const base = services.map((s, n) => ({ slug: s.slug, image: s.image, icon: s.icon, title: `${s.title} Project`, property: props[n] ?? "Property", sector: n % 2 === 0 ? "Residential" : "Commercial", items: s.items.slice(0, 3) }));
  const list = useList("projects", base);
  const cards = list.ids.map((id) => ({ id, ...list.def(id), sector: c.get(`projects.${id}.sector`, list.def(id).sector) }));
  const allWord = c.get("projects.filterAll", "All");
  const sectors = Array.from(new Set(cards.map((x) => x.sector.trim()).filter(Boolean)));
  const [filter, setFilter] = useState<string>("");
  const shown = c.edit || !filter ? cards : cards.filter((x) => x.sector.trim() === filter);
  return (
    <>
      <PageHeader k="projects" title="Projects" crumb="Projects" image={hero3Asset.url} />
      <div className="band py-5">
        <div className="container">
          <SectionTitle k="projects.intro" kicker="Our Projects" title="Demonstrating Our Work Through Real Projects" />
          <p className="text-center mx-auto mb-5" style={{ maxWidth: 800 }}>
            <T k="projects.intro.text" d="Our project portfolio gives clients a clearer understanding of the work undertaken by QMEP Electromechanical LLC, including maintenance, HVAC, electrical, plumbing and other electromechanical work." />
          </p>
          <div className="pj-filters" role="tablist">
            <button type="button" role="tab" aria-selected={!filter} className={`pj-filter ${!filter ? "is-active" : ""}`} onClick={() => setFilter("")}>
              {c.edit ? <T k="projects.filterAll" d="All" line /> : allWord}<span>{cards.length}</span>
            </button>
            {sectors.map((f) => (
              <button key={f} type="button" role="tab" aria-selected={filter === f} data-derived="sector"
                className={`pj-filter ${filter === f ? "is-active" : ""}`} onClick={() => setFilter(f)}>
                {f}<span>{cards.filter((x) => x.sector.trim() === f).length}</span>
              </button>
            ))}
          </div>
          {c.edit && <p className="text-center small text-muted cms-hint">Filter buttons are made from each project's category (the label on the photo).</p>}
          <div className="pj-grid">
            {shown.map((p, i) => (
              <article key={p.id} className="pj-card">
                <ItemTools list={list} id={p.id} />
                <div className="pj-media">
                  <Img k={`projects.${p.id}.img`} d={p.image} alt={p.title} />
                  <span className="pj-shade" aria-hidden="true" />
                  <span className="pj-chip"><Icon k={`projects.${p.id}.icon`} d={p.icon} /><T k={`projects.${p.id}.sector`} d={list.def(p.id).sector} line /></span>
                  <span className="pj-num">{String(i + 1).padStart(2, "0")}</span>
                  <Link to="/services/$slug" params={{ slug: p.slug }} className="pj-zoom" aria-label={`View ${p.title}`}>
                    <i className="fa fa-arrow-right"></i>
                  </Link>
                  <div className="pj-overlay-title">
                    <span><T k={`projects.${p.id}.property`} d={p.property} line /></span>
                    <h3><T k={`projects.${p.id}.title`} d={p.title} /></h3>
                  </div>
                </div>
                <div className="pj-body">
                  <div className="pj-meta">
                    <div><small><T k="projects.propertyLabel" d="Property" line /></small><strong><T k={`projects.${p.id}.property`} d={p.property} line /></strong></div>
                    <div><small><T k="projects.locationLabel" d="Location" line /></small><strong><T k={`projects.${p.id}.location`} d="Dubai, UAE" line /></strong></div>
                  </div>
                  <Scope id={p.id} items={p.items} />
                  <Link to="/services/$slug" params={{ slug: p.slug }} className="pj-link">
                    <T k="projects.link" d="View Service" line /> <i className="fa fa-long-arrow-alt-right"></i>
                  </Link>
                </div>
              </article>
            ))}
            <AddItem list={list} label="Add project" />
          </div>
        </div>
      </div>
      <CtaBanner k="projects.cta" title="Discuss Your Project" text="Tell us about your property or project, and let us help you identify the next steps." button="Discuss Your Project" />
    </>
  );
}
