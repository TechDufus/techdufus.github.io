import animate from 'tailwindcss-animate';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        canvas: '#090a0d',
        panel: '#11131a',
        line: '#232a3a',
        ink: '#e8ebf6',
        muted: '#9aa3b8',
        signal: '#63f2c8',
        ember: '#f4a259',
        electric: '#6ec8ff'
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
