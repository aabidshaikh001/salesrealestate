/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
        domains: ['oxmjhfafozlafqrhhawl.supabase.co', 'img.clerk.com']
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'https://api.realestatecompany.co.in/api/:path*', // Proxy to Backend
            },
        ];
    },
};

export default nextConfig;
