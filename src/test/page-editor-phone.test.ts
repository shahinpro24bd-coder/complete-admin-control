import { describe, it, expect } from "vitest";
import { defaults, withPhone } from "@/lib/cms";

describe("changing the phone number on a page", () => {
  it("also updates the call and WhatsApp links", () => {
    const co = withPhone({ ...defaults.company }, "+971 50 123 4567");
    expect(co.phone).toBe("+971 50 123 4567");
    expect(co.phoneHref).toBe("tel:+971501234567");
    expect(co.whatsappHref).toBe("https://wa.me/971501234567");
  });
  it("keeps the old links while the box is emptied", () => {
    const co = withPhone({ ...defaults.company }, "");
    expect(co.phoneHref).toBe(defaults.company.phoneHref);
  });
});
