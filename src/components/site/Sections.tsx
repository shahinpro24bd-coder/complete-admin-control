import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { company, faqs, processSteps, services, whyUs } from "@/lib/site";
import { SectionTitle } from "./Layout";
import about1Asset from "@/assets/about-1.webp.asset.json";
const about1 = about1Asset.url;
import about2Asset from "@/assets/about-2.webp.asset.json";
const about2 = about2Asset.url;
import { T, Img, Icon, useEditable, useList, ItemTools, AddItem } from "@/lib/editable";

export function ServicesGrid() {
  return (
    <div className="band py-5">
      <div className="container">
        <SectionTitle k="svcgrid" kicker="Our Core Services" title="Complete MEP Solutions For Your Property" />
        <div className="row g-4">
          {services.map((s, i) => (
            <div key={s.slug} className="col-lg-4 col-md-6">
              <Link to="/services/$slug" params={{ slug: s.slug }} className="svc-card">
                <Img k={`services.${i}.image`} d={s.image} className="svc-bg" alt={s.title} />
                <span className="svc-shade" aria-hidden="true" />
                <span className="svc-grid" aria-hidden="true" />
                <div className="svc-body">
                  <div className="svc-top">
                    <span className="svc-icon"><Icon k={`services.${i}.icon`} d={s.icon} /></span>
                    <span className="svc-num">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="svc-title"><T k={`services.${i}.title`} d={s.title} /></h3>
                  <p className="svc-text"><T k={`services.${i}.summary`} d={s.summary} /></p>
                  <span className="svc-more">
                    <span className="svc-more-btn"><i className="fa fa-plus"></i><em><T k="svcgrid.more" d="Read More" line /></em></span>
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function WhyUs() {
  const list = useList("why", whyUs.slice(0, 4));
  return (
    <div className="band py-5 why-section">
      <div className="why-gridbg" aria-hidden="true" />
      <div className="container position-relative">
        <div className="row g-5 align-items-center">
          <div className="col-lg-6">
            <div className="why-kicker"><span><T k="why.kicker" d="Why Choose Us" line /></span></div>
            <h1 className="display-5 mb-3"><T k="why.title" d="Practical Solutions. Professional Service. Reliable Support." /></h1>
            <p className="why-lead mb-4"><T k="why.lead" d="We focus on practical solutions, professional service, and clear communication throughout every stage of a project." /></p>
            <div className="row g-3">
              {list.ids.map((id, i) => {
                const w = list.def(id);
                return (
                  <div key={id} className="col-sm-6">
                    <div className="why-card">
                      <ItemTools list={list} id={id} />
                      <span className="why-num">{String(i + 1).padStart(2, "0")}</span>
                      <span className="why-icon"><Icon k={`why.${id}.icon`} d={w.icon} /></span>
                      <h3 className="why-title"><T k={`why.${id}.title`} d={w.title} /></h3>
                      <p className="why-text"><T k={`why.${id}.text`} d={w.text} /></p>
                      <span className="why-corner" aria-hidden="true" />
                    </div>
                  </div>
                );
              })}
              <AddItem list={list} label="Add reason" wrap={(b) => <div className="col-sm-6">{b}</div>} />
            </div>
            <div className="d-flex flex-wrap gap-3 mt-4">
              <Link to="/about" className="btn btn-primary py-3 px-5"><T k="why.btn" d="More About Our Company" line /></Link>
              <a href={company.whatsappHref} target="_blank" rel="noreferrer" className="why-btn-ghost btn py-3 px-4">
                <i className="fab fa-whatsapp me-2"></i><T k="why.wa" d="Chat on WhatsApp" line />
              </a>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="why-media">
              <span className="why-tick why-tick-tl" aria-hidden="true" />
              <span className="why-tick why-tick-tr" aria-hidden="true" />
              <span className="why-tick why-tick-bl" aria-hidden="true" />
              <span className="why-tick why-tick-br" aria-hidden="true" />
              <Img k="why.img1" d={about1} className="why-img-main" alt="MEP engineer on site in Dubai" />
              <Img k="why.img2" d={about2} className="why-img-sub" alt="VRF indoor unit installation" />
              <a className="why-badge" href={company.phoneHref}>
                <span className="why-badge-icon"><Icon k="why.callIcon" d="fa-phone-alt" /></span>
                <span className="why-badge-text">
                  <small><T k="why.callLabel" d="Call Our Team" line /></small>
                  <strong><Co f="phone" /></strong>
                </span>
              </a>
              <span className="why-vert" aria-hidden="true"><T k="why.vert" d="QMEP — MEP Solutions" line /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export type Audience = { img: string; title: string; sub: string; icon: string; text: string };

export function WhoWeServe({ audiences }: { audiences: Audience[] }) {
  const list = useList("aud", audiences);
  return (
    <div className="band py-5 aud-section">
      <div className="aud-gridbg" aria-hidden="true" />
      <div className="container position-relative">
        <div className="row g-4 align-items-end">
          <div className="col-lg-7">
            <div className="why-kicker"><span><T k="aud.kicker" d="Who We Serve" line /></span></div>
            <h1 className="display-5 mb-3"><T k="aud.title" d="Supporting Property Owners, Managers & Contractors" /></h1>
            <p className="why-lead mb-0"><T k="aud.lead" d="From single villas to commercial facilities, we adapt our MEP services to the property you manage and the way you work." /></p>
          </div>
          <div className="col-lg-5">
            <div className="d-flex justify-content-lg-end">
              <a className="aud-call" href={company.phoneHref}>
                <span className="aud-call-icon"><Icon k="aud.callIcon" d="fa-phone-alt" /></span>
                <span className="aud-call-text">
                  <small><T k="aud.callLabel" d="Call Our Team" line /></small>
                  <strong><Co f="phone" /></strong>
                </span>
              </a>
            </div>
          </div>
        </div>
        <div className="row g-4 pt-4">
          {list.ids.map((id, i) => {
            const a = list.def(id);
            return (
              <div key={id} className="col-lg-3 col-md-6">
                <div className="aud-card">
                  <ItemTools list={list} id={id} />
                  <div className="aud-media">
                    <Img k={`aud.${id}.img`} d={a.img} alt={a.title} />
                    <span className="aud-shade" aria-hidden="true" />
                    <span className="aud-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="aud-corner" aria-hidden="true" />
                  </div>
                  <div className="aud-body">
                    <span className="aud-icon"><Icon k={`aud.${id}.icon`} d={a.icon} /></span>
                    <h3 className="aud-title"><T k={`aud.${id}.title`} d={a.title} /></h3>
                    <span className="aud-sub"><T k={`aud.${id}.sub`} d={a.sub} line /></span>
                    <p className="aud-text"><T k={`aud.${id}.text`} d={a.text} /></p>
                  </div>
                </div>
              </div>
            );
          })}
          <AddItem list={list} label="Add card" wrap={(b) => <div className="col-lg-3 col-md-6">{b}</div>} />
        </div>
      </div>
    </div>
  );
}

const processIcons = ["fa-comments", "fa-search", "fa-file-invoice", "fa-tools", "fa-check-circle"];

export function Process() {
  const list = useList("prc", processSteps.map((p, i) => ({ ...p, icon: processIcons[i] ?? "fa-check" })));
  const stepWord = useEditable().get("prc.stepWord", "Step");
  return (
    <div className="band py-5 prc-section">
      <div className="prc-gridbg" aria-hidden="true" />
      <div className="container position-relative py-4">
        <div className="row g-4 align-items-end mb-5">
          <div className="col-lg-7">
            <div className="why-kicker"><span><T k="prc.kicker" d="Our Work Process" line /></span></div>
            <h1 className="display-5 mb-0 prc-heading"><T k="prc.title" d="A Clear And Straightforward Approach" /></h1>
          </div>
          <div className="col-lg-5">
            <p className="prc-lead mb-0"><T k="prc.lead" d="Five simple steps from your first message to a completed job — transparent, scheduled and fully communicated." /></p>
          </div>
        </div>
        <div className="prc-track">
          <span className="prc-line" aria-hidden="true" />
          {list.ids.map((id, i) => {
            const p = list.def(id);
            return (
              <div key={id} className="prc-step">
                <div className="prc-node">
                  <span className="prc-node-ring" aria-hidden="true" />
                  <Icon k={`prc.${id}.icon`} d={p.icon} />
                </div>
                <div className="prc-card">
                  <ItemTools list={list} id={id} />
                  <span className="prc-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="prc-label">{list.edit ? <T k="prc.stepWord" d="Step" line /> : stepWord} {String(i + 1).padStart(2, "0")}</span>
                  <h3 className="prc-title"><T k={`prc.${id}.title`} d={p.title} /></h3>
                  <p className="prc-text"><T k={`prc.${id}.text`} d={p.text} /></p>
                  <span className="why-corner" aria-hidden="true" />
                </div>
              </div>
            );
          })}
        </div>
        <AddItem list={list} label="Add step" wrap={(b) => <div className="mt-3">{b}</div>} />
      </div>
    </div>
  );
}

export function Faq() {
  const [open, setOpen] = useState(0);
  const c = useEditable();
  return (
    <div className="band py-5 faq-section">
      <div className="container py-4">
        <div className="row g-5">
          <div className="col-lg-4">
            <div className="faq-side">
              <div className="why-kicker"><span><T k="faq.kicker" d="FAQ" line /></span></div>
              <h1 className="display-5 mb-3"><T k="faq.title" d="Frequently Asked Questions" /></h1>
              <p className="why-lead mb-4"><T k="faq.lead" d="Quick answers about our services, maintenance contracts and how to get a quotation." /></p>
              <a className="faq-help" href={company.whatsappHref} target="_blank" rel="noreferrer">
                <span className="faq-help-icon"><i className="fab fa-whatsapp"></i></span>
                <span><small><T k="faq.helpSmall" d="Still have questions?" line /></small><strong><T k="faq.helpStrong" d="Ask our team" line /></strong></span>
                <i className="fa fa-arrow-right ms-auto"></i>
              </a>
            </div>
          </div>
          <div className="col-lg-8">
            {faqs.map((f, i) => {
              const on = open === i || c.edit;
              return (
                <div key={i} className={`faq-item${on ? " is-open" : ""}`}>
                  {c.faq && <ItemTools list={{ edit: true, remove: () => c.faq!.remove(i), move: (_id, dir) => c.faq!.move(i, dir) }} id={i} />}
                  <button type="button" className="faq-q" aria-expanded={on} onClick={() => setOpen(open === i ? -1 : i)}>
                    <span className="faq-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="faq-title"><T k={`faqs.${i}.q`} d={f.q} /></span>
                    <span className="faq-toggle"><i className="fa fa-plus"></i></span>
                  </button>
                  <div className="faq-a"><div><p><T k={`faqs.${i}.a`} d={f.a} /></p></div></div>
                </div>
              );
            })}
            {c.faq && <AddItem list={{ edit: true, add: c.faq.add }} label="Add question" />}
          </div>
        </div>
      </div>
    </div>
  );
}

const propertyTypes = ["Villa", "Apartment", "Residential Building", "Office", "Retail / Commercial", "Other"];

export function QuoteForm() {
  const c = useEditable();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const ptypes = useList("form.ptype", propertyTypes);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (c.edit) return;
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    setBusy(true); setErr("");
    const { supabase } = await import("@/lib/supabase");
    const { error } = await supabase.from("quote_requests").insert({
      name: v("name"), company: v("company") || null, phone: v("phone"), email: v("email") || null,
      location: v("location"), service: v("service"), property_type: v("property_type") || null, details: v("details"),
    });
    setBusy(false);
    if (error) setErr(c.get("form.error", "Sorry, we couldn't send your request. Please try again or call us."));
    else setSent(true);
  };
  if (sent)
    return (
      <div className="qt-form qt-thanks text-center h-100 d-flex flex-column justify-content-center">
        <Icon k="form.doneIcon" d="fa-check-circle" className="fa-4x text-primary mb-4" />
        <h3><T k="form.thanksTitle" d="Thank You!" line /></h3>
        <p className="mb-0"><T k="form.thanksText" d="Thank you for contacting QMEP Electromechanical LLC. Your inquiry has been received. Our team will review the information and contact you regarding the next steps." /></p>
      </div>
    );
  const h = { height: 55 };
  // In the editor, each box shows its placeholder text as an editable value.
  const ph = (k: string, d: string) => {
    const v = c.get(`form.ph.${k}`, d);
    return c.edit
      ? { value: v, onChange: (e: { target: { value: string } }) => c.set(`form.ph.${k}`, e.target.value), title: "Edit the hint text shown in this box", className: "form-control cms-ph" }
      : { placeholder: v, className: "form-control" };
  };
  return (
    <form onSubmit={submit} className="qt-form row g-3 mx-0">
      <div className="col-12 qt-form-head"><span className="qt-form-tag"><T k="form.tag" d="Free Quotation" line /></span><h3 className="mb-1"><T k="form.title" d="Tell Us About Your Project" /></h3><p className="mb-0"><T k="form.note" d="We usually respond within one working day." /></p></div>
      <div className="col-12 col-sm-6"><input name="name" required={!c.edit} maxLength={120} {...ph("name", "Full Name")} style={h} /></div>
      <div className="col-12 col-sm-6"><input name="company" maxLength={120} {...ph("company", "Company Name (Optional)")} style={h} /></div>
      <div className="col-12 col-sm-6"><input name="phone" required={!c.edit} maxLength={40} type={c.edit ? "text" : "tel"} {...ph("phone", "Phone Number")} style={h} /></div>
      <div className="col-12 col-sm-6"><input name="email" maxLength={200} type={c.edit ? "text" : "email"} {...ph("email", "Email Address (Optional)")} style={h} /></div>
      <div className="col-12 col-sm-6"><input name="location" required={!c.edit} maxLength={200} {...ph("location", "Property Location")} style={h} /></div>
      <div className="col-12 col-sm-6">
        {c.edit ? (
          <input {...ph("service", "Service Required")} style={h} />
        ) : (
          <select name="service" required className="form-select" style={h} defaultValue="">
            <option value="" disabled>{c.get("form.ph.service", "Service Required")}</option>
            {services.map((s) => <option key={s.slug}>{s.title}</option>)}
            <option>{c.get("form.other", "Other")}</option>
          </select>
        )}
      </div>
      <div className="col-12">
        {c.edit ? (
          <div className="cms-options">
            <input {...ph("ptype", "Property Type")} style={h} />
            <small className="d-block mt-2 mb-1">Property type choices:</small>
            {ptypes.ids.map((id) => (
              <span key={id} className="cms-option"><T k={`form.ptype.${id}`} d={ptypes.def(id)} line /><ItemTools list={ptypes} id={id} /></span>
            ))}
            <AddItem list={ptypes} label="Add choice" />
          </div>
        ) : (
          <select name="property_type" className="form-select" style={h} defaultValue="">
            <option value="" disabled>{c.get("form.ph.ptype", "Property Type")}</option>
            {ptypes.ids.map((id) => { const v = c.get(`form.ptype.${id}`, ptypes.def(id)); return <option key={id}>{v}</option>; })}
          </select>
        )}
      </div>
      <div className="col-12">
        {c.edit
          ? <textarea rows={2} {...ph("details", "Project Details")} />
          : <textarea name="details" required maxLength={3000} className="form-control" rows={5} placeholder={c.get("form.ph.details", "Project Details")}></textarea>}
      </div>
      {c.edit && (
        <div className="col-12 cms-options">
          <small className="d-block mb-1">Service list's last choice:</small>
          <T k="form.other" d="Other" line />
          <small className="d-block mt-3 mb-1">Button text while sending:</small>
          <T k="form.sending" d="Sending…" line />
          <small className="d-block mt-3 mb-1">Message if sending fails:</small>
          <T k="form.error" d="Sorry, we couldn't send your request. Please try again or call us." />
          <small className="d-block mt-3 mb-1">Thank-you message after sending (click the tick to change it):</small>
          <div className="text-center"><Icon k="form.doneIcon" d="fa-check-circle" className="fa-3x text-primary mb-2" /></div>
          <T k="form.thanksTitle" d="Thank You!" line />
          <T k="form.thanksText" d="Thank you for contacting QMEP Electromechanical LLC. Your inquiry has been received. Our team will review the information and contact you regarding the next steps." />
        </div>
      )}
      {err && <div className="col-12 text-danger">{err}</div>}
      <div className="col-12"><button className="btn btn-primary w-100 py-3" type="submit" disabled={busy}>{busy ? c.get("form.sending", "Sending…") : <T k="form.button" d="Request My Quote" line />}</button></div>
    </form>
  );
}

export function QuoteSection() {
  return (
    <div className="band py-5 qt-section">
      <div className="container py-4">
        <div className="row g-5 align-items-center">
          <div className="col-lg-5">
            <div className="why-kicker"><span><T k="qt.kicker" d="Request a Quote" line /></span></div>
            <h1 className="display-5 mb-4"><T k="qt.title" d="Need Professional MEP Support?" /></h1>
            <p className="why-lead mb-4"><T k="qt.lead" d="From air conditioning and electrical work to plumbing and planned maintenance, QMEP Electromechanical LLC is ready to discuss your requirements. Tell us about your property or project, and let us help you identify the next steps." /></p>
            <div className="row g-3">
              <ContactLine icon="fa-phone-alt" k="qt.l1" label="Call Our Team" value={company.phone} field="phone" href={company.phoneHref} />
              <ContactLine icon="fa-whatsapp" brand k="qt.l2" label="Chat on WhatsApp" value="Message Us Now" editValue href={company.whatsappHref} />
              <ContactLine icon="fa-envelope-open" k="qt.l3" label="Mail Us Now" value={company.email} field="email" href={`mailto:${company.email}`} />
            </div>
          </div>
          <div className="col-lg-7"><QuoteForm /></div>
        </div>
      </div>
    </div>
  );
}

/** Contact row. Values that come from Contact Info stay there; `editValue` makes a fixed value editable here. */
export function ContactLine({ icon, label, value, href, brand, k, editValue, field }: { icon: string; label: string; value: string; href?: string; brand?: boolean; k?: string; editValue?: boolean; field?: CompanyField }) {
  return (
    <div className="col-12">
      <a className="qt-line" href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
        <span className="qt-line-icon">{brand ? <i className={`fab ${icon}`}></i> : <Icon k={k && `${k}.icon`} d={icon} />}</span>
        <span className="qt-line-text"><small><T k={k && `${k}.label`} d={label} line /></small><strong>{field ? <Co f={field} /> : editValue ? <T k={k && `${k}.value`} d={value} line /> : value}</strong></span>
        <i className="fa fa-arrow-right qt-line-arrow"></i>
      </a>
    </div>
  );
}

export function CtaBanner({ title, text, button, k, kicker = "Annual Maintenance" }: { title: string; text: string; button: string; k?: string | undefined; kicker?: string }) {
  return (
    <div className="band py-5">
      <div className="container">
        <div className="cta-box">
          <span className="cta-grid" aria-hidden="true" />
          <span className="why-tick why-tick-tl" aria-hidden="true" />
          <span className="why-tick why-tick-br" aria-hidden="true" />
          <div className="row g-4 align-items-center position-relative">
            <div className="col-lg-7 text-center text-lg-start">
              <div className="why-kicker justify-content-center justify-content-lg-start"><span><T k={k && `${k}.kicker`} d={kicker} line /></span></div>
              <h1 className="display-6 mb-3"><T k={k && `${k}.title`} d={title} /></h1>
              <p className="mb-0 why-lead"><T k={k && `${k}.text`} d={text} /></p>
            </div>
            <div className="col-lg-5">
              <div className="cta-actions">
                <Link to="/contact" className="btn btn-primary py-3 px-4"><T k={k && `${k}.button`} d={button} line /><i className="fa fa-arrow-right ms-2"></i></Link>
                <a href={company.whatsappHref} target="_blank" rel="noreferrer" className="btn btn-dark py-3 px-4">
                  <i className="fab fa-whatsapp me-2"></i><T k={k && `${k}.wa`} d="Chat on WhatsApp" line />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
