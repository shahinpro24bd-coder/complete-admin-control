import { Link } from "@tanstack/react-router";
import hero2Asset from "@/assets/hero-2.webp.asset.json";
import { services } from "@/lib/site";
import { PageHeader, SectionTitle } from "@/components/site/Layout";
import { CtaBanner, Process, ServicesGrid } from "@/components/site/Sections";
import { T, Img, Icon } from "@/lib/editable";

export function ServicesPage() {
  return (
    <>
      <PageHeader k="services" title="Services" crumb="Services" image={hero2Asset.url} />
      <ServicesGrid />
      <div className="band py-5">
        <div className="container">
          <SectionTitle k="services.details" kicker="Service Details" title="Solutions For Your Property's Essential Systems" />
          {services.map((s, n) => (
            <div key={s.slug} id={s.slug} className="row g-5 align-items-center mb-5">
              <div className={`col-lg-5 ${n % 2 ? "order-lg-2" : ""}`}>
                <Img k={`services.${n}.image`} d={s.image} className="img-fluid w-100" alt={s.title} style={{ height: 420, objectFit: "cover" }} />
              </div>
              <div className="col-lg-7">
                <h4 className="section-title">0{n + 1}</h4>
                <h1 className="display-6 mb-3"><T k={`services.${n}.title`} d={s.title} /></h1>
                <p className="mb-4"><T k={`services.${n}.summary`} d={s.summary} /></p>
                <div className="row">
                  {s.items.map((it, j) => (
                    <div key={j} className="col-sm-6"><p><Icon k="services.checkIcon" d="fa-check" className="text-primary me-3" /><T k={`services.${n}.items.${j}`} d={it} /></p></div>
                  ))}
                </div>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  <Link to="/services/$slug" params={{ slug: s.slug }} className="btn btn-primary py-3 px-5"><T k="services.detailsBtn" d="View Service Details" line /></Link>
                  <Link to="/contact" className="btn btn-outline-primary py-3 px-4"><T k={`services.${n}.cta`} d={s.cta} line /></Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Process />
      <CtaBanner k="services.cta" title="Need a Specific Service?" text="Tell us what you need, where the property is located, and whether the work involves maintenance, repair, installation, or a new project." button="Request a Service Quote" />
    </>
  );
}
