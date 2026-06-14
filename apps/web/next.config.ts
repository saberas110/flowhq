import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    transpilePackages: ["@flowhq/shared"],
    env: {
        HOST: "127.0.0.1",
        PORT: "6500",
    },
    // Proxy API requests to Django - makes cookies same-origin
    async rewrites() {
        // Use IP for external access, localhost for internal
        // const djangoUrl = process.env.DJANGO_URL || 'http://api:8000';
        const djangoUrl = process.env.DJANGO_URL || 'http://api:8000';
        return [
            {
                source: '/api/:path*',
                destination: `${djangoUrl}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;
