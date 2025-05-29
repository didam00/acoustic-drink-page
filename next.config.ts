/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    domains: ['i.ytimg.com'],
  },
  // Firebase Hosting을 위한 설정
  trailingSlash: true,
  // ESLint 검사 비활성화
  eslint: {
    // 배포 시 ESLint 검사 비활성화
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
