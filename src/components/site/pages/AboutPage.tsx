import { Link } from "@tanstack/react-router";
import hero1Asset from "@/assets/hero-1.webp";
import about1Asset from "@/assets/about-1.webp";
import about2Asset from "@/assets/about-2.webp";
import buildingsAsset from "@/assets/buildings.webp";
import hvacImgAsset from "@/assets/service-hvac.webp";
import elecImgAsset from "@/assets/service-electrical.webp";
import plumbImgAsset from "@/assets/service-plumbing.webp";
import { PageHeader } from "@/components/site/Layout";
import { services } from "@/lib/site";
import { T, Img, Icon, useEditable, useList, ItemTools, AddItem, safeImg } from "@/lib/editable";

function PillarTags({ i, items }: { i: number; items: string[] }) {
  const list = useList(`about.pillar.${i}.tag`, items);
  return (
    <div className="abx-pillar-tags">
      {list.ids.map((id) => <span key={id}><T k={`about.pillar.${i}.tag.${id}`} d={list.def(id)} line />{list.edit && <ItemTools list={list} id={id} />}</span>)}
      <AddItem list={list} label="Tag" />
    </div>
  );
}

const hero1 = hero1Asset;
const about1 = about1Asset;
const about2 = about2Asset;
const buildings = buildingsAsset;

const pillars = [
  { letter: "M", word: "Mechanical", img: hvacImgAsset, text: "Air conditioning, ventilation and VRF/VRV systems that keep spaces comfortable all year.", items: ["AC & HVAC", "VRF/VRV", "Ventilation"] },
  { letter: "E", word: "Electrical", img: elecImgAsset, text: "Installation, upgrades and fault-finding for safe, dependable power and lighting.", items: ["Power & DB", "Lighting", "Inspections"] },
  { letter: "P", word: "Plumbing", img: plumbImgAsset, text: "Water supply, drainage and leak repairs that protect your property from damage.", items: ["Water supply", "Drainage", "Leak repair"] },
];

const approach = [
  { icon: "fa-comments", title: "Listen First", text: "We start by understanding your property, your systems and what you actually need." },
  { icon: "fa-search", title: "Assess Honestly", text: "We inspect, explain what we find, and recommend only the work that makes sense." },
  { icon: "fa-file-signature", title: "Agree the Scope", text: "Clear scope, timeline and pricing in writing before any work begins." },
  { icon: "fa-tools", title: "Deliver With Care", text: "Clean, careful workmanship with respect for your property and occupants." },
  { icon: "fa-handshake", title: "Stay in Touch", text: "Follow-up, records and maintenance advice to keep systems running well." },
];

const clients = ["Villa Owners", "Apartment Residents", "Landlords", "Property Managers", "Facility Managers", "Offices", "Retail Spaces", "Fit-Out Contractors", "Main Contractors"];

const values = [
  { icon: "fa-award", title: "Quality", text: "Focus on workmanship and applicable technical requirements." },
  { icon: "fa-balance-scale", title: "Integrity", text: "Communicate honestly about services, pricing, and project scope." },
  { icon: "fa-hard-hat", title: "Responsibility", text: "Approach each assignment with care and professionalism." },
  { icon: "fa-user-check", title: "Customer Focus", text: "Understand client requirements before recommending solutions." },
  { icon: "fa-chart-line", title: "Continuous Improvement", text: "Seek better ways to deliver effective and efficient services." },
];

export function AboutPage() {
  const c = useEditable();
  const commitRaw = c.get("about.commit.image", about2);
  const commitImg = safeImg(commitRaw, about2);
  const pillarList = useList("about.pillar", pillars);
  const valueList = useList("about.value", values);
  const stepList = useList("about.step", approach);
  const clientList = useList("about.client", clients);
  const stepWord = c.get("about.stepWord", "Step");
  return (
    <>
      <PageHeader k="about" title="About Us" crumb="About" image={hero1} />
      <div className="band py-5 ab-section">
        <div className="ab-gridbg" aria-hidden="true" />
        <div className="container position-relative">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <div className="ab-media">
                <span className="ab-frame" aria-hidden="true" />
                <span className="why-tick why-tick-tl" aria-hidden="true" />
                <span className="why-tick why-tick-tr" aria-hidden="true" />
                <Img k="about.img1" d={about1} className="ab-img-main" alt="MEP engineer on a Dubai project" />
                <Img k="about.img2" d={about2} className="ab-img-sub" alt="AC technician at work" />
                <span className="ab-vert" aria-hidden="true"><T k="about.vert" d="QMEP · Dubai · UAE" line /></span>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="why-kicker"><span><T k="about.kicker" d="About QMEP" line /></span></div>
              <h1 className="display-5 mb-3"><T k="about.title" d="Supporting Better-Performing Buildings Through MEP Solutions" /></h1>
              <p className="ab-lead mb-4"><T k="about.lead" d="QMEP Electromechanical LLC is an electromechanical services company focused on building systems, maintenance, and technical service requirements." /></p>
              <p className="ab-text mb-3"><T k="about.p1" d="We understand that properly functioning mechanical, electrical, and plumbing systems are essential to the comfort, safety, and day-to-day operation of a property." /></p>
              <p className="ab-text mb-4"><T k="about.p2" d="Our approach is built around understanding each client's needs, discussing practical solutions, and carrying out work according to the agreed project scope — building long-term relationships through clear communication and a commitment to quality." /></p>
              <Link className="btn btn-primary py-3 px-5" to="/contact"><T k="about.btn" d="Talk to Our Team" line /></Link>
            </div>
          </div>
        </div>
      </div>

      <div className="abx-marquee" aria-hidden="true">
        <div className="abx-marquee-track">
          {[...services, ...services].map((sv, i) => (
            <span key={i}><Icon k={`services.${i % services.length}.icon`} d={sv.icon} /><T k={`services.${i % services.length}.title`} d={sv.title} line /></span>
          ))}
        </div>
      </div>

      <section className="abx-mv">
        <div className="container">
          <div className="abx-mv-grid">
            <div className="abx-mv-card abx-mv-card--dark">
              <span className="abx-mv-word" aria-hidden="true"><T k="about.mission.word" d="Mission" line /></span>
              <span className="abx-mv-icon"><Icon k="about.mission.icon" d="fa-bullseye" /></span>
              <span className="ind-kicker"><T k="about.mission.kicker" d="What drives us" line /></span>
              <h2><T k="about.mission.title" d="Our Mission" line /></h2>
              <p><T k="about.mission.text" d="To provide practical and dependable electromechanical solutions that help our clients maintain functional, comfortable, and well-maintained properties." /></p>
            </div>
            <div className="abx-mv-img">
              <Img k="about.mv.image" d={buildings} alt="Dubai buildings" />
              <span className="abx-mv-tag"><T k="about.mv.tag" d="Dubai · UAE" line /></span>
            </div>
            <div className="abx-mv-card">
              <span className="abx-mv-word" aria-hidden="true"><T k="about.vision.word" d="Vision" line /></span>
              <span className="abx-mv-icon"><Icon k="about.vision.icon" d="fa-eye" /></span>
              <span className="ind-kicker"><T k="about.vision.kicker" d="Where we're going" line /></span>
              <h2><T k="about.vision.title" d="Our Vision" line /></h2>
              <p><T k="about.vision.text" d="To build lasting client relationships and become a trusted choice for MEP and maintenance solutions through consistent service and professional development." /></p>
            </div>
          </div>
        </div>
      </section>

      <section className="abx-pillars">
        <div className="container">
          <div className="abx-head">
            <span className="ind-kicker"><T k="about.pillars.kicker" d="What We Do" line /></span>
            <h2 className="sd-title text-white"><T k="about.pillars.title" d="Three Disciplines." line /> <em><T k="about.pillars.em" d="One Team." line /></em></h2>
          </div>
          <div className="abx-pillar-grid">
            {pillarList.ids.map((id) => {
              const pl = pillarList.def(id);
              return (
                <div key={id} className="abx-pillar">
                  <ItemTools list={pillarList} id={id} />
                  <Img k={`about.pillar.${id}.img`} d={pl.img} alt={pl.word} />
                  <span className="abx-pillar-shade" aria-hidden="true" />
                  <span className="abx-pillar-letter"><T k={`about.pillar.${id}.letter`} d={pl.letter} line /></span>
                  <div className="abx-pillar-body">
                    <h3><T k={`about.pillar.${id}.word`} d={pl.word} line /></h3>
                    <p><T k={`about.pillar.${id}.text`} d={pl.text} /></p>
                    <PillarTags i={id} items={pl.items} />
                  </div>
                </div>
              );
            })}
            <AddItem list={pillarList} label="Add discipline" />
          </div>
        </div>
      </section>

      <section className="abx-values">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-4">
              <div className="abx-sticky">
                <span className="ind-kicker"><T k="about.values.kicker" d="Core Values" line /></span>
                <h2 className="sd-title"><T k="about.values.title" d="What Guides Every Project" /></h2>
                <p><T k="about.values.lead" d="Five principles shape how we quote, how we work and how we treat every property we step into." /></p>
                <span className="abx-values-big" aria-hidden="true">{String(valueList.ids.length).padStart(2, "0")}</span>
              </div>
            </div>
            <div className="col-lg-8">
              {valueList.ids.map((id, i) => {
                const v = valueList.def(id);
                return (
                  <div key={id} className="abx-value">
                    <ItemTools list={valueList} id={id} />
                    <span className="abx-value-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="abx-value-icon"><Icon k={`about.value.${id}.icon`} d={v.icon} /></span>
                    <div><h3><T k={`about.value.${id}.title`} d={v.title} line /></h3><p className="mb-0"><T k={`about.value.${id}.text`} d={v.text} /></p></div>
                    <i className="fa fa-arrow-right abx-value-arrow"></i>
                  </div>
                );
              })}
              <AddItem list={valueList} label="Add value" />
            </div>
          </div>
        </div>
      </section>

      <section className="abx-approach">
        <div className="container">
          <div className="abx-head text-center mx-auto">
            <span className="ind-kicker"><T k="about.approach.kicker" d="Our Approach" line /></span>
            <h2 className="sd-title"><T k="about.approach.title" d="How We Work With You" /></h2>
          </div>
          <div className="abx-path">
            {stepList.ids.map((id, i) => {
              const a = stepList.def(id);
              return (
                <div key={id} className="abx-step">
                  <ItemTools list={stepList} id={id} />
                  <span className="abx-step-dot"><Icon k={`about.step.${id}.icon`} d={a.icon} /></span>
                  <span className="abx-step-num">{c.edit ? <T k="about.stepWord" d="Step" line /> : stepWord} {String(i + 1).padStart(2, "0")}</span>
                  <h3><T k={`about.step.${id}.title`} d={a.title} line /></h3>
                  <p className="mb-0"><T k={`about.step.${id}.text`} d={a.text} /></p>
                </div>
              );
            })}
          </div>
          <AddItem list={stepList} label="Add step" wrap={(b) => <div className="mt-3 text-center">{b}</div>} />
        </div>
      </section>

      <section className="abx-clients">
        <div className="container">
          <div className="abx-clients-box">
            <div>
              <span className="ind-kicker"><T k="about.clients.kicker" d="Who We Work With" line /></span>
              <h2 className="sd-title mb-0"><T k="about.clients.title" d="From single homes to commercial sites" /></h2>
            </div>
            <div className="abx-chips">
              {clientList.ids.map((id) => <span key={id}><Icon k="about.client.icon" d="fa-check" /><T k={`about.client.${id}`} d={clientList.def(id)} line />{c.edit && <ItemTools list={clientList} id={id} />}</span>)}
              <AddItem list={clientList} label="Add" />
            </div>
          </div>
        </div>
      </section>

      <section className={`abx-commit ${c.edit ? "cms-img" : ""}`} style={{ backgroundImage: `url(${commitImg})` }}
        onClick={c.edit ? (e) => { if (e.target === e.currentTarget) c.pick("about.commit.image"); } : undefined}>
        <div className="container">
          <div className="abx-commit-inner">
            <Icon k="about.commit.icon" d="fa-quote-left" className="abx-quote" />
            <span className="ind-kicker"><T k="about.commit.kicker" d="Our Commitment" line /></span>
            <p className="abx-commit-text"><T k="about.commit.text" d="Every property has different requirements. We aim to understand those requirements, explain the available options, and agree on a clear scope of work before starting a project." /></p>
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              <Link className="btn btn-primary py-3 px-5" to="/contact"><T k="about.commit.btn1" d="Talk to Our Team" line /></Link>
              <Link className="btn ft-ghost py-3 px-5" to="/services"><T k="about.commit.btn2" d="Explore Services" line /></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
