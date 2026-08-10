export default function Loading() {
  return (
    <div className="genfinity-loader" role="status" aria-live="polite" aria-label="Loading Genfinity O&P">
      <div className="genfinity-loader__grid" aria-hidden="true" />
      <div className="genfinity-loader__glow" aria-hidden="true" />
      <div className="genfinity-loader__content">
        <div className="genfinity-loader__mark" aria-hidden="true">
          <span className="genfinity-loader__orbit"><i /></span>
          <span className="genfinity-loader__pulse" />
        </div>
        <div className="genfinity-loader__logo-wrap">
          <span className="genfinity-loader__shine" aria-hidden="true" />
          <img src="/images/brand/genfinity-logo.webp" alt="Genfinity O&P" className="genfinity-loader__logo" />
        </div>
        <p className="genfinity-loader__message">Preparing care around your next step</p>
        <p className="genfinity-loader__eyebrow">Orthotics · Prosthetics · Mobility</p>
        <div className="genfinity-loader__progress" aria-hidden="true"><span /></div>
        <div className="genfinity-loader__steps" aria-hidden="true"><i /><i /><i /></div>
      </div>
      <span className="sr-only">Loading page content…</span>
    </div>
  );
}
