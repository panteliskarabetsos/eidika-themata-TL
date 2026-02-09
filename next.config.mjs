/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  serverExternalPackages: ["sequelize", "pg", "pg-hstore"],
  experimental: {
     reactCompiler: true,
  },
};

export default nextConfig;
