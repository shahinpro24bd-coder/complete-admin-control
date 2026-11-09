import { Link } from "@tanstack/react-router";
import buildingsAsset from "@/assets/buildings.webp";
import imgResAsset from "@/assets/about-1.webp";
import imgComAsset from "@/assets/hero-2.webp";
import imgFitAsset from "@/assets/about-2.webp";
import imgFmAsset from "@/assets/service-maintenance.webp";
import imgMcAsset from "@/assets/hero-3.webp";
import { PageHeader } from "@/components/site/Layout";
import { CtaBanner } from "@/components/site/Sections";
import { T, Img, Icon, useList, ItemTools, AddItem } from "@/lib/editable";

const list = [
  { img: imgResAsset, tag: "Villas · Apartments", icon: "fa-home", title: "Residential Properties", text: "Maintenance and repair support for villas, apartments, and residential buildings." },
  { img: imgComAsset, tag: "Offices · Retail", icon: "fa-building", title: "Commercial Buildings", text: "MEP services for offices, retail spaces, and commercial facilities." },
  { img: imgFitAsset, tag: "Interiors · Coordination", icon: "fa-drafting-compass", title: "Fit-Out Projects", text: "Coordination and technical support for electromechanical requirements within fit-out projects." },
  { img: imgFmAsset, tag: "Service Scopes · AMC", icon: "fa-clipboard-list", title: "Property & Facility Management", text: "Maintenance support aligned with agreed service scopes and property requirements." },
  { img: imgMcAsset, tag: "Specs · Schedules", icon: "fa-hard-hat", title: "Main Contractors", text: "MEP project support based on technical specifications, project schedules, and contractual requirements." },
];

export function IndustriesPage() {
  const items = useList("ind", list);
  return (
    <>
      <PageHeader k="industries" title="Industries" crumb="Industries We Serve" image={buildingsAsset} />
      <section className="ind-section">
        <span className="ind-grid-bg" aria-hidden="true" />
        <div className="container position-relative">
          <div className="ind-head">
            <div>
              <span className="ind-kicker"><T k="ind.kicker" d="Industries We Serve" line /></span>
              <h2 className="ind-title"><T k="ind.title" d="MEP Solutions For Different" /> <em><T k="ind.titleEm" d="Property Types" line /></em></h2>
            </div>
            <p className="ind-lead"><T k="ind.lead" d="From private villas to large commercial sites, we adapt our electromechanical expertise to the way each property works." /></p>
          </div>
          <div className="ind-bento">
            {items.ids.map((id, i) => {
              const l = items.def(id);
              return (
                <article key={id} className={`ind-card ind-card--${(i % 5) + 1}`}>
                  <ItemTools list={items} id={id} />
                  <Img k={`ind.${id}.img`} d={l.img} alt={l.title} className="ind-img" />
                  <span className="ind-shade" aria-hidden="true" />
                  <span className="ind-num">{String(i + 1).padStart(2, "0")}</span>
                  <div className="ind-body">
                    <span className="ind-icon"><Icon k={`ind.${id}.icon`} d={l.icon} /></span>
                    <span className="ind-tag"><T k={`ind.${id}.tag`} d={l.tag} line /></span>
                    <h3 className="ind-card-title"><T k={`ind.${id}.title`} d={l.title} /></h3>
                    <p className="ind-text"><T k={`ind.${id}.text`} d={l.text} /></p>
                  </div>
                  <span className="ind-corner" aria-hidden="true" />
                </article>
              );
            })}
            <AddItem list={items} label="Add industry" />
            <Link to="/contact" className="ind-card ind-card--cta">
              <span className="ind-kicker"><T k="ind.cta.kicker" d="Not listed?" line /></span>
              <h3 className="ind-card-title"><T k="ind.cta.title" d="Tell us about your property" /></h3>
              <span className="ind-cta-btn"><T k="ind.cta.btn" d="Get in touch" line /> <i className="fa fa-arrow-right"></i></span>
            </Link>
          </div>
        </div>
      </section>
      <CtaBanner k="ind.banner" title="Discuss Your Requirements" text="Whatever your property type, our team is ready to understand your needs and recommend suitable MEP solutions." button="Discuss Your Requirements" />
    </>
  );
}
