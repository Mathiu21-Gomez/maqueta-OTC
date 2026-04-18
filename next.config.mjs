/** @type {import('next').NextConfig} */
const nextConfig = {
  // Type errors must fail the build; use `pnpm typecheck` locally before shipping.
  images: {
    unoptimized: true,
  },
}

export default nextConfig
