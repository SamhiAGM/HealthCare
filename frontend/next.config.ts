import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // This uses the environment variable you set in Azure!
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://lankacare-backend.azurewebsites.net'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
