import hvacAsset from "@/assets/service-hvac.webp.asset.json";
const hvac = hvacAsset.url;
import electricalAsset from "@/assets/service-electrical.webp.asset.json";
const electrical = electricalAsset.url;
import plumbingAsset from "@/assets/service-plumbing.webp.asset.json";
const plumbing = plumbingAsset.url;
import maintenanceAsset from "@/assets/service-maintenance.webp.asset.json";
const maintenance = maintenanceAsset.url;
import amcAsset from "@/assets/service-amc.webp.asset.json";
const amc = amcAsset.url;
import vrfAsset from "@/assets/service-vrf.webp.asset.json";
const vrf = vrfAsset.url;

// Contact details are placeholders until QMEP confirms official values.
export const company = {
  name: "QMEP Electromechanical LLC",
  short: "QMEP",
  phone: "+971 56 547 7186",
  phoneHref: "tel:+971565477186",
  whatsappHref: "https://wa.me/971565477186",
  email: "info@qmep.ae",
  address: "Dubai, United Arab Emirates",
  hours: "Mon – Sat, 8:00 AM – 6:00 PM",
  facebook: "",
  instagram: "",
  linkedin: "",
  mapQuery: "Dubai, United Arab Emirates",
};

export type Service = {
  slug: string;
  title: string;
  icon: string;
  image: string;
  summary: string;
  items: string[];
  cta: string;
};

export const services: Service[] = [
  {
    slug: "hvac",
    title: "HVAC & Air Conditioning",
    icon: "fa-snowflake",
    image: hvac,
    summary:
      "Air conditioning solutions designed to support indoor comfort, system efficiency, and dependable operation.",
    items: [
      "AC installation and replacement",
      "AC servicing and troubleshooting",
      "Preventive AC maintenance",
      "VRF/VRV system installation and maintenance",
      "Commercial HVAC solutions",
      "Air conditioning system inspections",
    ],
    cta: "Explore HVAC Services",
  },
  {
    slug: "electrical",
    title: "Electrical Services",
    icon: "fa-bolt",
    image: electrical,
    summary:
      "Electrical installation, inspection, troubleshooting, and maintenance solutions for residential and commercial properties.",
    items: [
      "Electrical installation and upgrades",
      "Lighting installation",
      "Electrical fault diagnosis",
      "Distribution board maintenance",
      "Electrical system inspections",
      "Preventive electrical maintenance",
    ],
    cta: "Explore Electrical Services",
  },
  {
    slug: "plumbing",
    title: "Plumbing Services",
    icon: "fa-faucet",
    image: plumbing,
    summary:
      "Practical plumbing solutions to help maintain reliable water supply, drainage, and plumbing systems.",
    items: [
      "Plumbing installation and repairs",
      "Water leakage troubleshooting",
      "Pipe maintenance and replacement",
      "Drainage system maintenance",
      "Bathroom and kitchen plumbing",
      "Preventive plumbing inspections",
    ],
    cta: "Explore Plumbing Services",
  },
  {
    slug: "mep-maintenance",
    title: "MEP Maintenance",
    icon: "fa-tools",
    image: maintenance,
    summary:
      "Coordinated maintenance solutions for the mechanical, electrical, and plumbing systems that support building operations.",
    items: [
      "Routine MEP inspections",
      "Preventive maintenance",
      "Fault diagnosis and repair",
      "Building systems maintenance",
      "Planned maintenance visits",
      "Support for residential and commercial properties",
    ],
    cta: "Explore MEP Maintenance",
  },
  {
    slug: "amc",
    title: "Annual Maintenance Contracts",
    icon: "fa-file-contract",
    image: amc,
    summary:
      "Planned maintenance services designed to help property owners and facility managers maintain building systems throughout the year.",
    items: [
      "Scheduled maintenance visits",
      "HVAC system servicing",
      "Electrical and plumbing inspections",
      "Preventive maintenance recommendations",
      "Fault reporting and service records",
      "Defined service response arrangements",
    ],
    cta: "Request an AMC Proposal",
  },
  {
    slug: "vrf",
    title: "VRF/VRV Systems",
    icon: "fa-fan",
    image: vrf,
    summary:
      "Specialized support for variable refrigerant flow systems, subject to technical capabilities and approved project scope.",
    items: [
      "System installation",
      "System inspection",
      "Maintenance and troubleshooting",
      "Performance checks",
      "Repair and replacement support",
    ],
    cta: "Discuss Your HVAC Project",
  },
];

export const whyUs = [
  { icon: "fa-award", title: "Quality-Focused Work", text: "We aim to deliver solutions that meet project requirements and applicable technical standards." },
  { icon: "fa-user-check", title: "Customer-Focused Approach", text: "We listen to your requirements and recommend suitable solutions based on your property's needs." },
  { icon: "fa-building", title: "Residential & Commercial Expertise", text: "We support different property types, from individual residences to commercial facilities." },
  { icon: "fa-shield-alt", title: "Preventive Maintenance", text: "Planned maintenance can help identify potential issues before they become major problems." },
  { icon: "fa-comments", title: "Clear Communication", text: "Clear information about scope of work, expected timelines, and costs before proceeding." },
  { icon: "fa-headset", title: "One Point of Contact", text: "Discuss all your MEP requirements with one team that helps identify the right service." },
];

export const processSteps = [
  { title: "Tell Us Your Requirements", text: "Contact our team and explain your maintenance issue, installation requirement, or project scope." },
  { title: "Assessment & Consultation", text: "We review the information provided and determine the appropriate next steps." },
  { title: "Quotation & Scope", text: "Receive a quotation outlining the proposed work, pricing, and relevant terms." },
  { title: "Service Execution", text: "Once approved, the work is scheduled and carried out according to the agreed scope." },
  { title: "Follow-Up", text: "We communicate the work completed and discuss relevant maintenance recommendations." },
];

export const faqs = [
  { q: "What services does QMEP Electromechanical LLC provide?", a: "We provide HVAC, electrical, plumbing, MEP maintenance, AMC and VRF/VRV services. Contact us to discuss your specific requirements." },
  { q: "Do you provide residential and commercial maintenance?", a: "Please contact our team with your property type and requirements so we can confirm the services available for your project." },
  { q: "Can I request an Annual Maintenance Contract?", a: "Yes. Contact our team to discuss your property, required systems, maintenance frequency, and proposed AMC scope." },
  { q: "How can I receive a quotation?", a: "Send us your requirements through WhatsApp, phone, or the website contact form. Our team will review the details and advise you on the next steps." },
  { q: "Do you handle HVAC installation and maintenance?", a: "Contact us with your system type and requirements so we can confirm whether the requested service falls within our capabilities." },
  { q: "Which areas do you serve?", a: "Contact us to confirm service availability for your property location in Dubai or elsewhere in the UAE." },
  { q: "Do you provide emergency maintenance?", a: "Contact us to confirm current availability, operating hours, and applicable emergency service arrangements." },
];
