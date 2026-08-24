import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white px-5 py-6" role="status" aria-label="Loading">
      <Image
        src="/images/brand/genfinity-logo-uploaded.webp"
        alt="Genfinity O&P"
        width={1100}
        height={275}
        priority
        className="h-auto w-[170px]"
      />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
