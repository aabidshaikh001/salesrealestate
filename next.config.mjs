/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: ['oxmjhfafozlafqrhhawl.supabase.co', 'img.clerk.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.realestatecompany.co.in/api/:path*', // Proxy to Backend
      },
    ];
  },
  // Add this line to ignore build errors
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
