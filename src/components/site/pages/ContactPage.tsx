import hero1Asset from "@/assets/hero-1.webp.asset.json";
import { company } from "@/lib/site";
import { PageHeader } from "@/components/site/Layout";
import { ContactLine, QuoteForm } from "@/components/site/Sections";
import { T } from "@/lib/editable";

export function ContactPage() {
  return (
    <>
      <PageHeader k="contact" title="Contact" crumb="Contact" image={hero1Asset.url} />
      <div className="band py-5">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6">
              <h4 className="section-title"><T k="contact.kicker" d="Contact Us" line /></h4>
              <h1 className="display-5 mb-4"><T k="contact.title" d="Let's Discuss Your MEP Requirements" /></h1>
              <p className="mb-4"><T k="contact.lead" d="Looking for HVAC maintenance, electrical work, plumbing services, or an electromechanical solution for your property? Contact our team to discuss the scope of work and request a quotation." /></p>
              <div className="row g-4">
                <ContactLine k="contact.l1" icon="fa-map-marker-alt" label="Our Office" value={company.address} />
                <ContactLine k="contact.l2" icon="fa-phone-alt" label="Call Us Now" value={company.phone} href={company.phoneHref} />
                <ContactLine k="contact.l3" icon="fa-whatsapp" brand label="WhatsApp" value="Chat With Us" editValue href={company.whatsappHref} />
                <ContactLine k="contact.l4" icon="fa-envelope-open" label="Mail Us Now" value={company.email} href={`mailto:${company.email}`} />
                <ContactLine k="contact.l5" icon="fa-clock" label="Working Hours" value={company.hours} />
              </div>
            </div>
            <div className="col-lg-6">
              <h3 className="mb-4"><T k="contact.formTitle" d="Request a Quote" line /></h3>
              <QuoteForm />
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid pt-5 px-0">
        <iframe title="QMEP location map" className="w-100" style={{ height: 450, border: 0 }}
          src={`https://www.google.com/maps?q=${encodeURIComponent(company.mapQuery || company.address)}&output=embed`}></iframe>
      </div>
    </>
  );
}
