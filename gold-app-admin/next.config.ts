import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/about", destination: "/#about", permanent: false },
      { source: "/faq", destination: "/#faq", permanent: false },
      { source: "/contact", destination: "/#contact", permanent: false },
    ];
  },
};

export default nextConfig;
