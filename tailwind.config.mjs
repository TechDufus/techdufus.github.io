/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  // src/styles/global.css carries its own reset (ported from the Studio mockup).
  corePlugins: { preflight: false },
  theme: {
    extend: {
      // Studio (Midnight) tokens, defined in src/styles/global.css.
      colors: {
        bg: 'var(--bg)',
        'bg-deep': 'var(--bg-deep)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        line: 'var(--line)',
        'line-2': 'var(--line-2)',
        'line-3': 'var(--line-3)',
        ink: 'var(--ink)',
        'ink-2': 'var(--ink-2)',
        'ink-hi': 'var(--ink-hi)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        accent: 'var(--accent)',
        'accent-hi': 'var(--accent-hi)',
        'on-accent': 'var(--on-accent)',
        gold: 'var(--gold)'
      },
      fontFamily: {
        display: 'var(--font-display)',
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)'
      },
      borderRadius: {
        xs: 'var(--r-xs)',
        sm: 'var(--r-sm)',
        DEFAULT: 'var(--r)',
        lg: 'var(--r-lg)',
        pill: 'var(--r-pill)'
      },
      maxWidth: {
        wrap: 'var(--wrap)'
      }
    }
  },
  plugins: []
};
