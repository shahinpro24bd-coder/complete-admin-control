import { useState } from "react";

// Font Awesome 5 (solid) icons that suit an MEP / building-services website.
export const ICONS = [
  "fa-snowflake", "fa-fan", "fa-wind", "fa-temperature-low", "fa-thermometer-half", "fa-fire", "fa-bolt", "fa-plug",
  "fa-lightbulb", "fa-solar-panel", "fa-battery-full", "fa-faucet", "fa-tint", "fa-shower", "fa-water", "fa-toilet",
  "fa-tools", "fa-wrench", "fa-hammer", "fa-screwdriver", "fa-hard-hat", "fa-hard-hat", "fa-cogs", "fa-cog",
  "fa-home", "fa-building", "fa-city", "fa-store", "fa-industry", "fa-warehouse", "fa-hotel", "fa-hospital",
  "fa-school", "fa-file-contract", "fa-file-invoice", "fa-file-signature", "fa-clipboard-list", "fa-clipboard-check", "fa-calendar-check", "fa-clock",
  "fa-check", "fa-check-circle", "fa-award", "fa-medal", "fa-star", "fa-thumbs-up", "fa-shield-alt", "fa-user-shield",
  "fa-user-check", "fa-users", "fa-user-tie", "fa-handshake", "fa-headset", "fa-comments", "fa-phone-alt", "fa-envelope",
  "fa-search", "fa-eye", "fa-bullseye", "fa-chart-line", "fa-balance-scale", "fa-leaf", "fa-recycle", "fa-drafting-compass",
  "fa-ruler-combined", "fa-truck", "fa-map-marker-alt", "fa-globe", "fa-heart", "fa-smile", "fa-rocket", "fa-exclamation-triangle",
].filter((v, i, a) => a.indexOf(v) === i);

export function IconPicker({ value, onPick, onClose }: { value: string; onPick: (icon: string) => void; onClose: () => void }) {
  const [custom, setCustom] = useState(value);
  return (
    <div className="cms-icon-modal" onClick={onClose}>
      <div className="cms-icon-box" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0">Choose an icon</h5>
          <button type="button" className="btn btn-sm btn-light border" onClick={onClose}>Close</button>
        </div>
        <div className="cms-icon-grid mb-3">
          {ICONS.map((ic) => (
            <button key={ic} type="button" title={ic.replace("fa-", "")} className={ic === value ? "is-active" : ""} onClick={() => onPick(ic)}>
              <i className={`fa ${ic}`}></i>
            </button>
          ))}
        </div>
        <label className="form-label small text-muted">Or type any Font Awesome icon name (e.g. fa-tools)</label>
        <div className="d-flex gap-2">
          <input className="form-control" value={custom} onChange={(e) => setCustom(e.target.value)} />
          <button type="button" className="btn btn-primary" onClick={() => custom.trim() && onPick(custom.trim().startsWith("fa-") ? custom.trim() : `fa-${custom.trim()}`)}>Use</button>
        </div>
      </div>
    </div>
  );
}
