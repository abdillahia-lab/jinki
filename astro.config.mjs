// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';
import compressor from 'astro-compressor';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://jinki.ai',
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    icon(),
    sitemap({
      filter: (page) => !page.includes('/embodied-ai') && !page.includes('/cafimaad'),
    }),
    compressor({ gzip: false, brotli: true }),
  ]
});