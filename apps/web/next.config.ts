import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@alta/ui',
    '@alta/design-tokens',
    '@alta/database',
    '@alta/domain',
    '@alta/validation',
    '@alta/config',
  ],
};

export default config;
