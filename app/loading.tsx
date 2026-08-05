export default function Loading() {
  return (
    <div className="genfinity-loader" role="status" aria-live="polite" aria-label="Loading Genfinity O&P">
      <div className="genfinity-loader__mesh" aria-hidden="true" />
      <div className="genfinity-loader__orb genfinity-loader__orb--one" aria-hidden="true" />
      <div className="genfinity-loader__orb genfinity-loader__orb--two" aria-hidden="true" />
      <div className="genfinity-loader__orb genfinity-loader__orb--three" aria-hidden="true" />

      <div className="genfinity-loader__stage" aria-hidden="true">
        <div className="genfinity-loader__ring genfinity-loader__ring--outer" />
        <div className="genfinity-loader__ring genfinity-loader__ring--middle" />
        <div className="genfinity-loader__ring genfinity-loader__ring--inner" />
        <div className="genfinity-loader__core">
          <span />
          <span />
          <span />
        </div>
        <i className="genfinity-loader__spark genfinity-loader__spark--one" />
        <i className="genfinity-loader__spark genfinity-loader__spark--two" />
        <i className="genfinity-loader__spark genfinity-loader__spark--three" />
      </div>

      <div className="genfinity-loader__content">
        <div className="genfinity-loader__logo-wrap">
          <img src="https://genfinityoandp.com/wp-content/uploads/2026/03/logo2.png" alt="Genfinity O&P" className="genfinity-loader__logo" />
        </div>
        <p className="genfinity-loader__eyebrow">Precision care in motion</p>
        <p className="genfinity-loader__message">Preparing your next step</p>
        <div className="genfinity-loader__progress" aria-hidden="true"><span /></div>
      </div>
      <span className="sr-only">Loading page content…</span>
    </div>
  );
}
