import { Link } from "@tanstack/react-router";
import amcImgAsset from "@/assets/service-amc.webp.asset.json";
import { PageHeader, SectionTitle } from "@/components/site/Layout";
import { CtaBanner } from "@/components/site/Sections";
import { T, Icon, useList, ItemTools, AddItem } from "@/lib/editable";
import type { List } from "@/lib/editable";

const plans = [
  { icon: "fa-home", name: "Residential AMC", for: "Villas and residential properties.", items: ["Scheduled AC maintenance", "Plumbing system checks", "Electrical inspections", "Preventive maintenance recommendations"] },
  { icon: "fa-store", name: "Commercial AMC", for: "Offices, retail spaces, and commercial properties.", items: ["Planned HVAC servicing", "Electrical system inspections", "Plumbing maintenance", "Maintenance reporting"] },
  { icon: "fa-city", name: "Comprehensive MEP AMC", for: "Properties requiring coordinated maintenance across multiple systems.", items: ["Agreed HVAC maintenance", "Electrical and plumbing inspections", "Scheduled preventive visits", "Defined reporting and service procedures"] },
];

function PlanItems({ i, items }: { i: number; items: string[] }) {
  const list = useList(`amc.plan.${i}.item`, items);
  return (
    <>
      {list.ids.map((id) => (
        <p key={id} className="text-start position-relative"><ItemTools list={list} id={id} /><i className="fa fa-check text-primary me-3"></i><T k={`amc.plan.${i}.item.${id}`} d={list.def(id)} /></p>
      ))}
      <AddItem list={list} label="Add line" />
    </>
  );
}

function Plans({ list }: { list: List<(typeof plans)[number]> }) {
  return (
    <>
      {list.ids.map((id) => {
        const p = list.def(id);
        return (
          <div key={id} className="col-lg-4" style={{ marginTop: 70 }}>
            <div className="fact-item text-center bg-light h-100 p-5 pt-0 position-relative">
              <ItemTools list={list} id={id} />
              <div className="fact-icon"><Icon k={`amc.plan.${id}.icon`} d={p.icon} className="fa-3x" /></div>
              <h3 className="mb-2"><T k={`amc.plan.${id}.name`} d={p.name} /></h3>
              <p className="text-primary mb-4"><T k={`amc.plan.${id}.for`} d={`Suitable for: ${p.for}`} /></p>
              <PlanItems i={id} items={p.items} />
              <Link to="/contact" className="btn btn-primary py-3 px-5 mt-3"><T k={`amc.plan.${id}.btn`} d="Get an AMC Quote" line /></Link>
            </div>
          </div>
        );
      })}
      <AddItem list={list} label="Add package" wrap={(b) => <div className="col-lg-4" style={{ marginTop: 70 }}>{b}</div>} />
    </>
  );
}

export function AmcPage() {
  const list = useList("amc.plan", plans);
  return (
    <>
      <PageHeader k="amc" title="AMC Packages" crumb="AMC Packages" image={amcImgAsset.url} />
      <div className="band py-5">
        <div className="container">
          <SectionTitle k="amc.intro" kicker="Annual Maintenance Contracts" title="Planned Maintenance For Long-Term Property Care" />
          <p className="text-center mx-auto mb-5" style={{ maxWidth: 800 }}>
            <T k="amc.intro.text" d="A maintenance plan helps property owners organize routine inspections, schedule servicing, and address maintenance requirements in a structured way. We prepare each AMC proposal based on your property type, equipment, and service requirements." />
          </p>
          <div className="row g-4 pt-4">
            <Plans list={list} />
          </div>
        </div>
      </div>
      <CtaBanner k="amc.cta" title="Request Your AMC Proposal" text="Every property has a different maintenance requirement. Contact our team for a proposal based on your building, equipment, and required scope." button="Get an AMC Quote" />
    </>
  );
}
