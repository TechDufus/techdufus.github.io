import animate from 'tailwindcss-animate';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        canvas: '#000104',
        panel: '#050a14',
        line: '#132238',
        ink: '#e6f2ff',
        muted: '#839bb9',
        signal: '#89d6ff',
        ember: '#f4a259',
        electric: '#22c4ff'
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
