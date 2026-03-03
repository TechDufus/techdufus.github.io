import animate from 'tailwindcss-animate';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        canvas: '#03060d',
        panel: '#0a1220',
        line: '#1a2c46',
        ink: '#eaf3ff',
        muted: '#8ea3c0',
        signal: '#8fd8ff',
        ember: '#f4a259',
        electric: '#27c8ff'
      },
      fontFamily: {
        sans: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      boxShadow: {
        editor: '0 24px 60px -32px rgba(0, 0, 0, 0.72)'
      }
    }
  },
  plugins: [animate, typography]
};
