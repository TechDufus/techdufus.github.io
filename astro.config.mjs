import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://techdufus.com',
  output: 'static',
  integrations: [mdx(), tailwind({ applyBaseStyles: false })],
  markdown: {
    syntaxHighlight: 'shiki'
  },
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }
});
