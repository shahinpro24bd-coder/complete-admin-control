import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import hero1Asset from "@/assets/hero-1.webp";
const hero1 = hero1Asset;
import hero2Asset from "@/assets/hero-2.webp";
const hero2 = hero2Asset;
import hero3Asset from "@/assets/hero-3.webp";
const hero3 = hero3Asset;
import about1Asset from "@/assets/about-1.webp";
const about1 = about1Asset;
import about2Asset from "@/assets/about-2.webp";
const about2 = about2Asset;
import buildingsAsset from "@/assets/buildings.webp";
const buildings = buildingsAsset;
import { company, services } from "@/lib/site";
import { SectionTitle } from "@/components/site/Layout";
import { CtaBanner, Faq, Process, QuoteSection, ServicesGrid, WhoWeServe, WhyUs } from "@/components/site/Sections";
import amcImgAsset from "@/assets/service-amc.webp";
const amcImg = amcImgAsset;
import maintImgAsset from "@/assets/service-maintenance.webp";
const maintImg = maintImgAsset;

import { T, Img, Icon, useEditable, useList, ItemTools, AddItem, safeImg } from "@/lib/editable";

const slideDefaults = [
  { img: hero1, step: "HVAC", title: "Reliable MEP Solutions for Buildings Across Dubai", text: "Professional electromechanical, HVAC, electrical, plumbing, and maintenance solutions designed to keep your property safe, comfortable, and operating efficiently." },
  { img: hero2, step: "Electrical", title: "Electrical Works You Can Depend On", text: "Installation, inspection, troubleshooting, and maintenance for residential and commercial properties." },
  { img: hero3, step: "Maintenance", title: "Planned Maintenance For Long-Term Property Care", text: "Annual Maintenance Contracts and preventive MEP maintenance tailored to your building's systems." },
];

const tabTitles = ["HVAC Works", "Electrical Works", "Plumbing Works", "MEP Maintenance"];

const aboutFeatures = [
  { icon: "fa-fan", text: "Air Conditioning & HVAC" },
  { icon: "fa-bolt", text: "Electrical Installations" },
  { icon: "fa-tint", text: "Plumbing Works" },
  { icon: "fa-tools", text: "Preventive Maintenance" },
];

const audiences = [
  {
    img: amcImg, icon: "fa-home", title: "Villa & Apartment Owners", sub: "Residential",
    text: "AC, electrical and plumbing care for homes — from single repairs to year-round maintenance.",
  },
  {
    img: buildings, icon: "fa-building", title: "Commercial Buildings", sub: "Offices & Retail",
    text: "Dependable MEP support for offices, shops and retail units, with minimal disruption to tenants.",
  },
  {
    img: maintImg, icon: "fa-clipboard-list", title: "Facility Management", sub: "Property Managers",
    text: "Planned AMC programs and routine visits that keep building systems running throughout the year.",
  },
  {
    img: about1, icon: "fa-hard-hat", title: "Main Contractors", sub: "Fit-Out & Projects",
    text: "A reliable MEP partner for fit-out and project works, delivered to the agreed scope and timeline.",
  },
];


export function HomeContent() {
  const { edit, get, pick } = useEditable();
  const slides = useList("home.hero", slideDefaults);
  const features = useList("home.about.f", aboutFeatures);
  const count = slides.ids.length;
  const [pos, setI] = useState(0);
  const i = count ? Math.min(pos, count - 1) : 0;
  const [tabPos, setTab] = useState(0);
  const tabs = services.slice(0, 4).map((sv, n) => ({ title: tabTitles[n] ?? sv.title, img: sv.image, s: sv }));
  const tab = Math.min(tabPos, Math.max(tabs.length - 1, 0));
  useEffect(() => {
    if (edit || count < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % count), 6000);
    return () => clearInterval(t);
  }, [edit, count]);
  const sid = slides.ids[i] ?? 0;
  const s = slides.def(sid);
  const cur = tabs[tab]!; // services list is never empty (falls back to bundled services)
  return (
    <>
      {/* Hero */}
      <section className="hero">
        {slides.ids.map((id, n) => (
          <img key={id} data-cms-img={edit ? "slide" : undefined} className={`hero-bg ${n === i ? "is-active" : ""}`} src={safeImg(get(`home.hero.${id}.img`, slides.def(id).img), slides.def(id).img)} alt="" loading="eager" decoding="async" width={1920} height={1088} />
        ))}
        <div className="hero-overlay" />
        <div className="container hero-content">
          <div className="row">
            <div className="col-lg-11 col-xl-9" key={i}>
              <span className="hero-kicker animated fadeInDown"><T k="home.hero.kicker" d="QMEP Electromechanical LLC · Dubai, UAE" /></span>
              <h1 className="hero-title text-white animated fadeInUp"><T k={`home.hero.${sid}.title`} d={s.title} /></h1>
              <p className="hero-text animated fadeInUp"><T k={`home.hero.${sid}.text`} d={s.text} /></p>
              <div className="d-flex flex-wrap gap-3 animated fadeInUp">
                <Link to="/contact" className="btn btn-primary py-3 px-5"><T k="home.hero.btn1" d="Request a Free Quote" line /></Link>
                <Link to="/contact" className="btn hero-btn-outline py-3 px-5"><T k="home.hero.btn2" d="Contact Our Team" line /></Link>
                <a href={company.whatsappHref} target="_blank" rel="noreferrer" className="btn hero-btn-wa py-3 px-4" aria-label="Chat on WhatsApp">
                  <i className="fab fa-whatsapp fs-5 me-2"></i><T k="home.hero.btn3" d="WhatsApp" line />
                </a>
              </div>
            </div>
          </div>
        </div>
        {edit && (
          <div className="cms-hero-pick d-flex flex-wrap gap-2">
            <button type="button" onClick={() => pick(`home.hero.${sid}.img`)}><i className="fa fa-image me-2"></i>Change slide {i + 1} background</button>
            <button type="button" onClick={() => { slides.add(); setI(count); }}><i className="fa fa-plus me-2"></i>Add slide</button>
            {count > 1 && <button type="button" onClick={() => { if (confirm("Remove this slide?")) { slides.remove(sid); setI(0); } }}><i className="fa fa-trash me-2"></i>Remove slide</button>}
          </div>
        )}
        <div className="hero-nav">
          <div className="container d-flex align-items-center justify-content-between">
            <div className="d-flex gap-4">
              {slides.ids.map((id, n) => (
                <button key={id} type="button" onClick={() => setI(n)} className={`hero-step ${n === i ? "is-active" : ""}`}>
                  <span>{String(n + 1).padStart(2, "0")}</span>
                  <small className="d-none d-md-block"><T k={`home.hero.${id}.step`} d={slides.def(id).step} line /></small>
                </button>
              ))}
            </div>
            <div className="d-flex gap-2">
              <button type="button" className="hero-arrow" aria-label="Previous" onClick={() => setI((i + count - 1) % Math.max(count, 1))}><i className="fa fa-arrow-left"></i></button>
              <button type="button" className="hero-arrow" aria-label="Next" onClick={() => setI((i + 1) % Math.max(count, 1))}><i className="fa fa-arrow-right"></i></button>
            </div>
          </div>
        </div>
      </section>
      <div className="pb-5"></div>


      {/* About */}
      <div className="band py-5 ab-section">
        <div className="ab-gridbg" aria-hidden="true" />
        <div className="container position-relative">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <div className="ab-media">
                <span className="ab-frame" aria-hidden="true" />
                <span className="why-tick why-tick-tl" aria-hidden="true" />
                <span className="why-tick why-tick-tr" aria-hidden="true" />
                <Img k="home.about.img1" d={about1} className="ab-img-main" alt="MEP engineer reviewing building systems" />
                <Img k="home.about.img2" d={about2} className="ab-img-sub" alt="Technician installing an AC unit" />
                <div className="ab-badge">
                  <span className="ab-badge-num"><T k="home.about.badgeNum" d="6" line /></span>
                  <span className="ab-badge-text"><small><T k="home.about.badge1" d="Core" line /></small><strong><T k="home.about.badge2" d="MEP Services" line /></strong></span>
                </div>
                <span className="ab-vert" aria-hidden="true"><T k="home.about.vert" d="QMEP · Dubai · UAE" line /></span>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="why-kicker"><span><T k="home.about.kicker" d="About Us" line /></span></div>
              <h1 className="display-5 mb-3"><T k="home.about.title" d="Your Trusted Partner For MEP Solutions" /></h1>
              <p className="ab-lead mb-4"><T k="home.about.lead" d="At QMEP Electromechanical LLC, we understand the importance of reliable building systems — air conditioning, electrical, plumbing and preventive maintenance that keep residential and commercial properties operating smoothly." /></p>
              <p className="ab-text mb-4"><T k="home.about.text" d="Whether you require routine maintenance, a technical repair, a new installation, or support for a commercial project, our team is ready to discuss your requirements." /></p>
              <div className="row g-3 mb-4">
                {features.ids.map((id) => {
                  const f = features.def(id);
                  return (
                    <div key={id} className="col-sm-6">
                      <div className="ab-check"><ItemTools list={features} id={id} /><Icon k={`home.about.f${id}.icon`} d={f.icon} /><span><T k={`home.about.f${id}`} d={f.text} /></span></div>
                    </div>
                  );
                })}
                <AddItem list={features} label="Add point" wrap={(b) => <div className="col-sm-6">{b}</div>} />
              </div>
              <div className="d-flex flex-wrap gap-3">
                <Link className="btn btn-primary py-3 px-5" to="/services"><T k="home.about.btn1" d="Discover Our Services" line /></Link>
                <Link className="ab-btn-ghost btn py-3 px-4" to="/about"><T k="home.about.btn2" d="More About Us" line /></Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ServicesGrid />
      <WhyUs />

      {/* Project tabs */}
      <div className="band project py-5">
        <div className="container">
          <SectionTitle k="home.proj" kicker="Our Projects" title="Real Work. Practical Solutions." />
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="nav nav-pills d-flex justify-content-between w-100 h-100 me-4">
                {tabs.map((t, n) => (
                  <button key={t.title} type="button" onClick={() => setTab(n)}
                    className={`nav-link w-100 d-flex align-items-center text-start p-4 ${n < 3 ? "mb-4" : "mb-0"} ${tab === n ? "active" : ""}`}>
                    <h3 className="m-0">0{n + 1}. <T k={`home.proj.tab${n}`} d={t.title} line /></h3>
                  </button>
                ))}
              </div>
            </div>
            <div className="col-lg-8">
              <div className="row g-4">
                <div className="col-md-6" style={{ minHeight: 350 }}>
                  <div className="position-relative h-100">
                    <Img k={`services.${tab}.image`} d={cur.img} className="position-absolute img-fluid w-100 h-100" style={{ objectFit: "cover" }} alt={cur.title} />
                  </div>
                </div>
                <div className="col-md-6">
                  <h1 className="mb-3"><T k={`services.${tab}.title`} d={cur.s.title} /></h1>
                  <p className="mb-4"><T k={`services.${tab}.summary`} d={cur.s.summary} /></p>
                  {cur.s.items.slice(0, 3).map((it, j) => (
                    <p key={j}><Icon k="home.proj.checkIcon" d="fa-check" className="text-primary me-3" /><T k={`services.${tab}.items.${j}`} d={it} /></p>
                  ))}
                  <Link to="/projects" className="btn btn-primary py-3 px-5 mt-3"><T k="home.proj.btn" d="View Our Projects" line /></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Who we serve */}
      <WhoWeServe audiences={audiences} />


      <Process />
      <CtaBanner k="home.cta" title="Plan Ahead. Maintain Your Property With Confidence." text="An Annual Maintenance Contract helps property owners and managers plan routine servicing for residential, villa, commercial, HVAC and combined MEP maintenance." button="Request an AMC Quote" />
      <QuoteSection />
      <Faq />
    </>
  );
}
