import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'dwnld.in',
    short_name: 'dwnld',
    description: 'Save videos and photos from Instagram, TikTok, X, LinkedIn and YouTube.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#eceef6',
    theme_color: '#4733ff',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    // Android: once installed, dwnld appears in the share sheet; /share finds
    // the link in whatever the app sent and starts the download.
    share_target: {
      action: '/share',
      method: 'GET',
      params: { title: 'title', text: 'text', url: 'url' },
    },
  } as MetadataRoute.Manifest;
}
