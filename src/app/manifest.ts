import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'dwnld.in',
    short_name: 'dwnld',
    description: 'Save videos and photos from Instagram, TikTok, X, LinkedIn and YouTube.',
    start_url: '/',
    display: 'standalone',
    background_color: '#eceef6',
    theme_color: '#4733ff',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
    // Android: "Share → dwnld" once the site is installed as an app.
    share_target: {
      action: '/',
      method: 'GET',
      params: { title: 'title', text: 'text', url: 'url' },
    },
  } as MetadataRoute.Manifest;
}
