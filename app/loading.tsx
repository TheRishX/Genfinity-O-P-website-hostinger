import Image from "next/image";

export default function Loading() {
  return (
    <div className="genfinity-loader" role="status" aria-label="Loading Genfinity O&P">
      <div className="genfinity-loader__grid" aria-hidden="true" />
      <div className="genfinity-loader__glow" aria-hidden="true" />

      <div className="genfinity-loader__content">
        <div className="genfinity-loader__mark" aria-hidden="true">
          <div className="genfinity-loader__orbit"><i /></div>
          <div className="genfinity-loader__pulse" />
        </div>

        <div className="genfinity-loader__logo-wrap">
          <Image
            src="/images/brand/genfinity-logo-uploaded.webp"
            alt="Genfinity O&P"
            width={1100}
            height={275}
            priority
            className="genfinity-loader__logo"
          />
          <div className="genfinity-loader__shine" aria-hidden="true" />
        </div>

        <p className="genfinity-loader__message">Preparing your next step</p>
        <p className="genfinity-loader__eyebrow">Genfinity O&amp;P</p>
        <div className="genfinity-loader__progress" aria-hidden="true"><span /></div>
        <div className="genfinity-loader__steps" aria-hidden="true"><i /><i /><i /></div>
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}
