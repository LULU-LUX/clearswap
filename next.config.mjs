/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Isso ajuda a evitar erros de rotas no deploy
  distDir: '.next',
};

export default nextConfig;
