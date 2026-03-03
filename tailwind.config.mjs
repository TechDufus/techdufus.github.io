import animate from 'tailwindcss-animate';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        canvas: '#070b14',
        panel: '#0f1624',
        line: '#273854',
        ink: '#edf4ff',
        muted: '#9ca9c2',
        signal: '#99dfff',
        ember: '#f4a259',
        electric: '#3acaff'
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
