import { T, Co, Icon, useEditable, safeImg } from "@/lib/editable";
import qmepLogo from "@/assets/qmep-logo.png";
import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { company, services } from "@/lib/site";


export function Topbar() {
  return (
    <div className="container-fluid bg-dark p-0">
      <div className="row gx-0 d-none d-lg-flex">
        <div className="col-lg-7 px-5 text-start">
          <div className="h-100 d-inline-flex align-items-center py-3 me-3">
            <a className="text-body px-2" href={company.phoneHref}>
              <Icon k="top.phoneIcon" d="fa-phone-alt" className="text-primary me-2" />
              <Co f="phone" />
            </a>
            <a className="text-body px-2" href={`mailto:${company.email}`}>
              <Icon k="top.emailIcon" d="fa-envelope-open" className="text-primary me-2" />
              <Co f="email" />
            </a>
          </div>
        </div>
        <div className="col-lg-5 px-5 text-end">
          <div className="h-100 d-inline-flex align-items-center py-3 me-2">
            <span className="text-body px-2">
              <Icon k="top.hoursIcon" d="fa-clock" className="text-primary me-2" />
              <Co f="hours" />
            </span>
          </div>
          <div className="h-100 d-inline-flex align-items-center">
            <a className="btn btn-sm-square btn-outline-body me-1" href={company.whatsappHref} target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <i className="fab fa-whatsapp"></i>
            </a>
            <Socials cls="btn btn-sm-square btn-outline-body me-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

const navLinks = [
  { to: "/", label: "Home", k: "nav.home", exact: true },
  { to: "/about", label: "About", k: "nav.about" },
  { to: "/services", label: "Services", k: "nav.services" },
  { to: "/projects", label: "Projects", k: "nav.projects" },
] as const;

const moreLinks = [
  { to: "/amc", label: "AMC Packages", k: "nav.amc", desc: "Annual maintenance plans", icon: "fa-file-contract" },
  { to: "/industries", label: "Industries We Serve", k: "nav.industries", desc: "Residential, commercial & more", icon: "fa-industry" },
] as const;

const contactLink = { to: "/contact", label: "Contact", k: "nav.contact" } as const;

/** Social media buttons; each shows only when its link is filled in under Contact Info. */
function Socials({ cls }: { cls: string }) {
  const links = [
    { href: company.facebook, icon: "fa-facebook-f", label: "Facebook" },
    { href: company.linkedin, icon: "fa-linkedin-in", label: "LinkedIn" },
    { href: company.instagram, icon: "fa-instagram", label: "Instagram" },
  ].filter((l) => l.href && l.href.trim() && l.href.trim() !== "#");
  return (
    <>
      {links.map((l) => (
        <a key={l.label} className={cls} href={l.href} target="_blank" rel="noreferrer" aria-label={l.label}><i className={`fab ${l.icon}`}></i></a>
      ))}
    </>
  );
}

function Logo() {
  const c = useEditable();
  return <img src={safeImg(c.get("site.logo", qmepLogo), qmepLogo)} alt="QMEP — Where Quality Meets Speed" className={`qn-logo ${c.edit ? "cms-img" : ""}`}
    title={c.edit ? "Click to change logo" : undefined}
    onClick={c.edit ? (e) => { e.preventDefault(); e.stopPropagation(); c.pick("site.logo"); } : undefined} />;
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header className={`qn ${scrolled ? "qn--scrolled" : ""}`}>
        <div className="qn-inner">
          <Link to="/" className="qn-brand" onClick={close} aria-label="QMEP home">
            <Logo />

          </Link>

          <nav className="qn-links" aria-label="Main">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="qn-link" activeProps={{ className: "qn-link is-active" }}
                activeOptions={{ exact: "exact" in l }}>
                <span><T k={l.k} d={l.label} line /></span>
              </Link>
            ))}
            <div className="qn-more">
              <button type="button" className="qn-link qn-more-btn" aria-haspopup="true">
                <span><T k="nav.more" d="More" line /></span><i className="fa fa-chevron-down"></i>
              </button>
              <div className="qn-panel">
                {moreLinks.map((m) => (
                  <Link key={m.to} to={m.to} className="qn-panel-item" activeProps={{ className: "qn-panel-item is-active" }}>
                    <span className="qn-panel-icon"><Icon k={`${m.k}.icon`} d={m.icon} /></span>
                    <span className="qn-panel-text"><strong><T k={m.k} d={m.label} line /></strong><small><T k={`${m.k}.desc`} d={m.desc} line /></small></span>
                    <i className="fa fa-arrow-right qn-panel-arrow"></i>
                  </Link>
                ))}
              </div>
            </div>
            <Link to="/contact" className="qn-link" activeProps={{ className: "qn-link is-active" }}><span><T k={contactLink.k} d={contactLink.label} line /></span></Link>
          </nav>

          <div className="qn-actions">
            <a href={company.phoneHref} className="qn-call">
              <span className="qn-call-icon"><Icon k="nav.callIcon" d="fa-phone-alt" /></span>
              <span className="qn-call-text"><small><T k="nav.callLabel" d="Call 24/7" line /></small><strong><Co f="phone" /></strong></span>
            </a>
            <Link to="/contact" className="qn-cta">
              <span><T k="nav.cta" d="Free Quote" line /></span><i className="fa fa-arrow-right"></i>
            </Link>
            <button type="button" className={`qn-burger ${open ? "is-open" : ""}`} aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
        <span className="qn-progress" aria-hidden="true" />
      </header>

      <div className={`qn-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="qn-drawer-backdrop" onClick={close} />
        <aside className="qn-drawer-panel">
          <div className="qn-drawer-kicker"><T k="nav.drawer" d="Navigation" line /></div>
          {[...navLinks, ...moreLinks, contactLink].map((l, i) => (
            <Link key={l.to} to={l.to} className="qn-drawer-link" activeProps={{ className: "qn-drawer-link is-active" }}
              activeOptions={{ exact: l.to === "/" }} onClick={close} style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}>
              <em>{String(i + 1).padStart(2, "0")}</em><T k={l.k} d={l.label} line /><i className="fa fa-arrow-right"></i>
            </Link>
          ))}
          <div className="qn-drawer-foot">
            <a href={company.phoneHref} className="qn-cta w-100 justify-content-center"><Icon k="nav.callIcon" d="fa-phone-alt" /><span><Co f="phone" /></span></a>
            <a href={company.whatsappHref} target="_blank" rel="noreferrer" className="qn-drawer-wa"><i className="fab fa-whatsapp"></i> <T k="nav.drawerWa" d="Chat on WhatsApp" line /></a>
          </div>
        </aside>
      </div>
    </>
  );
}

export function PageHeader({ title, crumb, image, k }: { title: string; crumb: string; image: string; k?: string }) {
  const c = useEditable();
  const raw = k ? c.get(`${k}.header.image`, image) : image;
  const img = raw && !raw.startsWith("/assets/") ? raw : image;
  return (
    <div
      className={`container-fluid page-header py-5 mb-5 ${c.edit && k ? "cms-img" : ""}`}
      title={c.edit && k ? "Click the background to change image" : undefined}
      onClick={c.edit && k ? (e) => { if (e.target === e.currentTarget) c.pick(`${k}.header.image`); } : undefined}
      style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url(${img})`, backgroundPosition: "center" }}
    >
      <div className="container py-5">
        <h1 className="display-1 text-white animated slideInDown"><T k={k && `${k}.header.title`} d={title} /></h1>
        <nav aria-label="breadcrumb" className="animated slideInDown">
          <ol className="breadcrumb text-uppercase mb-0">
            <li className="breadcrumb-item"><Link className="text-white" to="/"><T k="crumb.home" d="Home" line /></Link></li>
            <li className="breadcrumb-item text-primary active" aria-current="page"><T k={k && `${k}.header.crumb`} d={crumb} line /></li>
          </ol>
        </nav>
      </div>
    </div>
  );
}

export function SectionTitle({ kicker, title, k }: { kicker: string; title: string; k?: string | undefined }) {
  return (
    <div className="text-center mx-auto mb-5" style={{ maxWidth: 650 }}>
      <h4 className="section-title"><T k={k && `${k}.kicker`} d={kicker} line /></h4>
      <h1 className="display-5 mb-4"><T k={k && `${k}.title`} d={title} /></h1>
    </div>
  );
}

export function Footer() {
  return (
    <div className="container-fluid bg-dark text-body footer ft-pro mt-5 pt-5 px-0">
      <span className="ft-glow" aria-hidden="true" />
      <div className="container ft-top">
        <div className="ft-cta">
          <div><span className="ft-cta-kicker"><T k="footer.kicker" d="Get In Touch" line /></span><h2 className="mb-0"><T k="footer.title" d="Ready to discuss your MEP requirements?" /></h2></div>
          <div className="d-flex flex-wrap gap-2">
            <a href={company.phoneHref} className="btn btn-primary py-3 px-4"><Icon k="footer.callIcon" d="fa-phone-alt" className="me-2" /><Co f="phone" /></a>
            <a href={company.whatsappHref} target="_blank" rel="noreferrer" className="btn ft-ghost py-3 px-4"><i className="fab fa-whatsapp me-2"></i><T k="footer.wa" d="WhatsApp" line /></a>
          </div>
        </div>
      </div>
      <div className="container py-5">
        <div className="row g-5">
          <div className="col-lg-3 col-md-6">
            <h3 className="text-light mb-4 ft-h"><T k="footer.brand" d="QMEP Electromechanical" line /></h3>
            <p><T k="footer.about" d="Professional MEP, HVAC, electrical, plumbing, and maintenance solutions for residential and commercial projects." /></p>
            <div className="d-flex pt-2">
              <a className="btn btn-square btn-outline-body me-1" href={company.whatsappHref} target="_blank" rel="noreferrer" aria-label="WhatsApp"><i className="fab fa-whatsapp"></i></a>
              <Socials cls="btn btn-square btn-outline-body me-1" />
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <h3 className="text-light mb-4 ft-h"><T k="footer.svcTitle" d="Our Services" line /></h3>
            {services.map((s, n) => (
              <Link key={s.slug} className="btn btn-link" to="/services/$slug" params={{ slug: s.slug }}><T k={`services.${n}.title`} d={s.title} line /></Link>
            ))}
          </div>
          <div className="col-lg-3 col-md-6">
            <h3 className="text-light mb-4 ft-h"><T k="footer.linksTitle" d="Quick Links" line /></h3>
            <Link className="btn btn-link" to="/"><T k="footer.link.home" d="Home" line /></Link>
            <Link className="btn btn-link" to="/about"><T k="footer.link.about" d="About Us" line /></Link>
            <Link className="btn btn-link" to="/services"><T k="footer.link.services" d="Services" line /></Link>
            <Link className="btn btn-link" to="/projects"><T k="footer.link.projects" d="Projects" line /></Link>
            <Link className="btn btn-link" to="/amc"><T k="footer.link.amc" d="AMC Packages" line /></Link>
            <Link className="btn btn-link" to="/industries"><T k="footer.link.industries" d="Industries We Serve" line /></Link>
            <Link className="btn btn-link" to="/contact"><T k="footer.link.contact" d="Contact Us" line /></Link>
          </div>
          <div className="col-lg-3 col-md-6">
            <h3 className="text-light mb-4 ft-h"><T k="footer.contactTitle" d="Contact" line /></h3>
            <p className="mb-2"><Icon k="footer.addrIcon" d="fa-map-marker-alt" className="text-primary me-3" /><Co f="address" /></p>
            <p className="mb-2"><Icon k="footer.phoneIcon" d="fa-phone-alt" className="text-primary me-3" /><Co f="phone" /></p>
            <p className="mb-2"><i className="fab fa-whatsapp text-primary me-3"></i><a className="text-body" href={company.whatsappHref} target="_blank" rel="noreferrer"><T k="footer.waUs" d="WhatsApp Us" line /></a></p>
            <p className="mb-2"><Icon k="footer.emailIcon" d="fa-envelope" className="text-primary me-3" /><Co f="email" /></p>
          </div>
        </div>
      </div>
      <div className="container-fluid copyright">
        <div className="container">
          <div className="row">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <T k="footer.copy" d="©" line /> {new Date().getFullYear()} <Link to="/"><Co f="name" /></Link>. <T k="footer.rights" d="All Rights Reserved." line />
            </div>
            <div className="col-md-6 text-center text-md-end"><T k="footer.location" d="Dubai, United Arab Emirates" line /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 300);
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <>
      <a href={company.whatsappHref} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"
        className="btn btn-lg btn-primary btn-lg-square back-to-top" style={{ display: "flex", bottom: show ? 90 : 30 }}>
        <i className="fab fa-whatsapp fs-4"></i>
      </a>
      {show && (
        <button className="btn btn-lg btn-dark btn-lg-square back-to-top" style={{ display: "flex" }} aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <i className="bi bi-arrow-up"></i>
        </button>
      )}
    </>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Topbar />
      <Navbar />
      {children}
      <Footer />
      <BackToTop />
    </>
  );
}
