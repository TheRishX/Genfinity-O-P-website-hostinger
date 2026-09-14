import { withOutstatic } from "outstatic/next-plugin";

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos", port: "", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "i.pravatar.cc", port: "", pathname: "/**" },
      { protocol: "https", hostname: "raw.githubusercontent.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "avatars.githubusercontent.com", port: "", pathname: "/**" },
    ],
  },
  transpilePackages: ["motion"],
  turbopack: {},
  async redirects() {
    return [
      { source: "/", destination: "/orthotics-prosthetics/", permanent: true },
      { source: "/contacts-us/", destination: "/contact", permanent: true },
      { source: "/our-services/", destination: "/services", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/patient-intake/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
          { key: "Referrer-Policy", value: "strict-origin" },
        ],
      },
      {
        source: "/staff/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
  webpack(config, { dev }) {
    if (dev && process.env.DISABLE_HMR === "true") {
      config.watchOptions = { ignored: /.*/ };
    }
    return config;
  },
};

export default withOutstatic(nextConfig);
