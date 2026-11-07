// Unique content for each service detail page (keyed by service slug).
export type ServiceDetail = {
  intro: string;
  stats: { value: string; label: string }[];
  signsTitle: string;
  signs: string[];
  benefits: { icon: string; title: string; text: string }[];
  faqs: { q: string; a: string }[];
};

export const serviceDetails: Record<string, ServiceDetail> = {
  hvac: {
    intro: "In the UAE climate, air conditioning runs almost all year. We help keep split units, ducted systems and commercial HVAC running efficiently, with less downtime and more consistent cooling.",
    stats: [{ value: "Split", label: "& ducted units" }, { value: "Home", label: "& commercial" }, { value: "Planned", label: "servicing visits" }],
    signsTitle: "When Your AC Needs Attention",
    signs: ["Rooms not cooling evenly", "Water dripping from indoor units", "Unusual noise or vibration", "Rising electricity bills", "Bad smell when the AC starts", "Frequent tripping or restarts"],
    benefits: [
      { icon: "fa-temperature-low", title: "Consistent Comfort", text: "Balanced cooling across rooms and floors." },
      { icon: "fa-leaf", title: "Better Efficiency", text: "Clean coils and filters help reduce energy use." },
      { icon: "fa-wind", title: "Cleaner Air", text: "Regular cleaning supports healthier indoor air." },
    ],
    faqs: [
      { q: "How often should an AC be serviced in Dubai?", a: "Many properties schedule servicing every 3–6 months, depending on usage and system type. We can recommend a suitable frequency." },
      { q: "Do you install new AC units?", a: "Yes, we support installation and replacement based on the agreed scope and site conditions." },
      { q: "Can you service commercial systems?", a: "Contact us with the system details so we can confirm the scope for your commercial property." },
    ],
  },
  electrical: {
    intro: "Safe, reliable power is essential for every property. Our electrical team handles installations, upgrades and fault-finding with attention to safety and clean workmanship.",
    stats: [{ value: "DB", label: "board maintenance" }, { value: "LED", label: "lighting upgrades" }, { value: "Fault", label: "diagnosis" }],
    signsTitle: "Warning Signs In Your Electrical System",
    signs: ["Breakers tripping often", "Flickering or dimming lights", "Warm or discoloured sockets", "Burning smell near outlets", "Not enough power points", "Old or outdated wiring"],
    benefits: [
      { icon: "fa-shield-alt", title: "Safety First", text: "Inspections help find hazards before they cause damage." },
      { icon: "fa-lightbulb", title: "Modern Lighting", text: "Efficient lighting tailored to each space." },
      { icon: "fa-plug", title: "Reliable Power", text: "Fewer interruptions for homes and businesses." },
    ],
    faqs: [
      { q: "Can you add new sockets or lighting points?", a: "Yes, we can review your space and propose suitable additions within the agreed scope." },
      { q: "Do you inspect distribution boards?", a: "Yes, DB inspections and maintenance are part of our electrical services." },
      { q: "What should I do if my breaker keeps tripping?", a: "Avoid resetting it repeatedly and contact us so a technician can diagnose the cause." },
    ],
  },
  plumbing: {
    intro: "Small leaks quickly become expensive problems. We repair, maintain and install plumbing systems so water supply and drainage stay dependable across your property.",
    stats: [{ value: "Leak", label: "troubleshooting" }, { value: "Kitchen", label: "& bathroom" }, { value: "Drain", label: "maintenance" }],
    signsTitle: "Common Plumbing Problems We Fix",
    signs: ["Low water pressure", "Slow or blocked drains", "Damp patches on walls or ceilings", "Running or leaking toilets", "Noisy pipes", "Water heater issues"],
    benefits: [
      { icon: "fa-tint", title: "Water Savings", text: "Fixing leaks reduces wasted water and bills." },
      { icon: "fa-home", title: "Protect Your Property", text: "Early repairs help prevent water damage." },
      { icon: "fa-sink", title: "Smooth Daily Use", text: "Reliable kitchens and bathrooms every day." },
    ],
    faqs: [
      { q: "Can you find hidden leaks?", a: "We troubleshoot leakage issues and advise on the repair scope after inspection." },
      { q: "Do you replace old pipes?", a: "Yes, pipe maintenance and replacement are part of our plumbing services." },
      { q: "Do you handle bathroom plumbing during renovations?", a: "Yes, contact us with your renovation scope and we will advise on next steps." },
    ],
  },
  "mep-maintenance": {
    intro: "Mechanical, electrical and plumbing systems work together. Our coordinated maintenance covers all three under one team, so building issues are spotted early and handled in one visit.",
    stats: [{ value: "3-in-1", label: "M · E · P" }, { value: "One", label: "team to contact" }, { value: "Routine", label: "inspections" }],
    signsTitle: "Why Coordinated Maintenance Matters",
    signs: ["Several contractors for one building", "Repeated breakdowns", "No record of past maintenance", "Unplanned repair costs", "Tenant or occupant complaints", "Ageing building systems"],
    benefits: [
      { icon: "fa-sitemap", title: "Everything Covered", text: "HVAC, electrical and plumbing in one plan." },
      { icon: "fa-calendar-check", title: "Fewer Surprises", text: "Planned checks reduce emergency call-outs." },
      { icon: "fa-clipboard-list", title: "Clear Reporting", text: "Findings and recommendations after each visit." },
    ],
    faqs: [
      { q: "What does MEP maintenance include?", a: "Routine inspections, preventive maintenance and repairs across mechanical, electrical and plumbing systems." },
      { q: "Is it suitable for villas?", a: "Yes, we support both residential and commercial properties." },
      { q: "Can maintenance be scheduled outside working hours?", a: "Contact us to discuss timing that suits your property." },
    ],
  },
  amc: {
    intro: "An Annual Maintenance Contract gives you planned visits, fixed scope and a single point of contact for the whole year — ideal for property owners and facility managers.",
    stats: [{ value: "12", label: "months coverage" }, { value: "Fixed", label: "agreed scope" }, { value: "Records", label: "for every visit" }],
    signsTitle: "Who An AMC Is Right For",
    signs: ["Villa and apartment owners", "Property and facility managers", "Offices and retail spaces", "Landlords with multiple units", "Buildings with older systems", "Anyone wanting predictable costs"],
    benefits: [
      { icon: "fa-wallet", title: "Predictable Budget", text: "Plan maintenance costs for the year ahead." },
      { icon: "fa-calendar-alt", title: "Scheduled Visits", text: "Maintenance happens on time, without reminders." },
      { icon: "fa-headset", title: "Priority Support", text: "Defined response arrangements when issues arise." },
    ],
    faqs: [
      { q: "What systems can an AMC cover?", a: "Typically HVAC, electrical and plumbing — the exact scope is agreed in your proposal." },
      { q: "How many visits are included?", a: "Visit frequency depends on your property and chosen plan. We'll recommend a suitable schedule." },
      { q: "Can I customise my AMC?", a: "Yes, contact us to build a scope around your property's needs." },
    ],
  },
  vrf: {
    intro: "VRF/VRV systems deliver efficient, zoned cooling for larger homes and commercial buildings. We support installation, inspection and maintenance to keep them performing at their best.",
    stats: [{ value: "Zoned", label: "climate control" }, { value: "Multi", label: "indoor units" }, { value: "Perf.", label: "checks" }],
    signsTitle: "Signs Your VRF System Needs Service",
    signs: ["Error codes on controllers", "Some zones not cooling", "Outdoor unit noise", "Higher power consumption", "Refrigerant-related faults", "No service in the last year"],
    benefits: [
      { icon: "fa-th-large", title: "Zone Control", text: "Different temperatures for different spaces." },
      { icon: "fa-bolt", title: "High Efficiency", text: "Well-maintained systems use less energy." },
      { icon: "fa-chart-line", title: "Longer Lifespan", text: "Regular checks help protect your investment." },
    ],
    faqs: [
      { q: "What is a VRF/VRV system?", a: "A system where one outdoor unit serves multiple indoor units with individual zone control." },
      { q: "Do you install VRF systems?", a: "Yes, subject to technical requirements and the approved project scope." },
      { q: "How often should VRF systems be maintained?", a: "We typically recommend regular planned maintenance — contact us for a schedule suited to your system." },
    ],
  },
};

/** Detail content for a service; services added from the admin panel get a generic starting text. */
export function getServiceDetail(slug: string, title: string): ServiceDetail {
  return serviceDetails[slug] ?? {
    intro: `Tell your customers more about ${title}: what you do, who it is for and why they should choose QMEP.`,
    stats: [{ value: "Home", label: "& commercial" }, { value: "Planned", label: "service visits" }, { value: "Clear", label: "scope & pricing" }],
    signsTitle: `When You Need ${title}`,
    signs: ["Describe a common problem here", "Add another sign customers notice", "Add one more reason to call"],
    benefits: [
      { icon: "fa-check-circle", title: "Quality Work", text: "Describe a benefit of this service." },
      { icon: "fa-clock", title: "On Schedule", text: "Describe another benefit." },
      { icon: "fa-shield-alt", title: "Peace of Mind", text: "Describe one more benefit." },
    ],
    faqs: [{ q: `What does ${title} include?`, a: "Write the answer here." }],
  };
}
