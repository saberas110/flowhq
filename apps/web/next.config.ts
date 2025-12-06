import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    transpilePackages: ["@flowhq/shared"],
    env: {
        HOST: "127.0.0.1",
        PORT: "6500",
    },
};

export default nextConfig;
