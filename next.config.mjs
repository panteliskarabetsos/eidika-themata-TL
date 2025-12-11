/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ["sequelize", "pg", "pg-hstore"],
  },
  reactCompiler: true,
};

export default nextConfig;
