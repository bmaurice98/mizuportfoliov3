import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The original pages now live as records in the store. Temporary (307) so
  // they can be brought back without browsers caching the redirect forever.
  async redirects() {
    return [
      { source: "/projects", destination: "/?record=discography", permanent: false },
      { source: "/experience", destination: "/?record=session-work", permanent: false },
      { source: "/contact", destination: "/?record=contact", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        search: "",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        port: "",
        search: "",
      }
    ],
  },
};

export default nextConfig;
