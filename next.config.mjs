/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
const { env } = await import('./src/env.mjs');

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  images: {
    unoptimized: !env.NEXT_PUBLIC_IMAGE_DOMAIN,
    domains: [env.NEXT_PUBLIC_IMAGE_DOMAIN ?? 'image.tmdb.org'],
    imageSizes: [48, 64, 96],
    deviceSizes: [128, 256, 512, 1200],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: true,
  async headers() {
    return [
      {
        // Apply to all watch pages to restrict ad-related browser APIs
        // available to cross-origin iframes without using the sandbox attribute
        source: '/watch/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: [
              'payment=()',
              'usb=()',
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'interest-cohort=()',
              'attribution-reporting=()',
              'browsing-topics=()',
              'join-ad-interest-group=()',
              'run-ad-auction=()',
            ].join(', '),
          },
        ],
      },
    ];
  },
};

export default config;
