import { fileURLToPath } from 'node:url';
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://techdufus.com',
  output: 'static',
  integrations: [mdx()],
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Sora',
      cssVariable: '--font-sora',
      weights: [400, 600, 700],
      styles: ['normal'],
      subsets: ['latin'],
      optimizedFallbacks: false,
      fallbacks: ['Avenir Next', 'Segoe UI', 'Helvetica Neue', 'system-ui', 'sans-serif']
    },
    {
      provider: fontProviders.google(),
      name: 'IBM Plex Mono',
      cssVariable: '--font-plex-mono',
      weights: [400, 600],
      styles: ['normal'],
      subsets: ['latin'],
      optimizedFallbacks: false,
      fallbacks: ['ui-monospace', 'SFMono-Regular', 'monospace']
    }
  ],
  markdown: {
    syntaxHighlight: 'prism'
  },
  prefetch: {
    defaultStrategy: 'hover'
  },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "base-uri 'self'",
        "form-action 'self'"
      ]
    }
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }
});
