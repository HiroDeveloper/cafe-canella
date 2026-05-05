import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/hiro',
        destination: '/admin',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
