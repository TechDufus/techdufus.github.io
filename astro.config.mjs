import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';

// Code blocks use the Studio mockup's code palette (the --tok-* tokens in src/styles/global.css):
// plain text --ink-2 on --bg-deep, commands/keywords --accent-hi, strings --tok-s, numbers and
// constants --tok-n, comments --faint italic. Colours are CSS variables, so the theme follows global.css.
const studioCodeTheme = {
  name: 'studio-midnight',
  type: 'dark',
  fg: 'var(--ink-2)',
  bg: 'var(--bg-deep)',
  colors: {
    'editor.foreground': 'var(--ink-2)',
    'editor.background': 'var(--bg-deep)'
  },
  tokenColors: [
    {
      scope: ['comment', 'punctuation.definition.comment', 'string.quoted.docstring.multi'],
      settings: { foreground: 'var(--faint)', fontStyle: 'italic' }
    },
    {
      scope: [
        'keyword',
        'storage.type',
        'storage.modifier',
        'entity.name.function',
        'support.function',
        'entity.name.command',
        'entity.name.tag',
        'support.type.property-name',
        'punctuation.definition.template-expression',
        'markup.heading'
      ],
      settings: { foreground: 'var(--accent-hi)' }
    },
    {
      scope: [
        'string',
        'punctuation.definition.string',
        'markup.inline.raw',
        'markup.fenced_code',
        'meta.link.inline.markdown'
      ],
      settings: { foreground: 'var(--tok-s)' }
    },
    {
      scope: ['constant.numeric', 'constant.language', 'constant.character', 'support.constant'],
      settings: { foreground: 'var(--tok-n)' }
    },
    {
      // Shell arguments and flags read as plain text, like the mockup's command lines.
      scope: ['string.unquoted.argument', 'constant.other.option', 'variable', 'variable.parameter', 'meta.property-name'],
      settings: { foreground: 'var(--ink-2)' }
    },
    {
      scope: ['punctuation', 'keyword.operator', 'meta.brace'],
      settings: { foreground: 'var(--muted)' }
    },
    { scope: ['markup.italic', 'emphasis'], settings: { fontStyle: 'italic' } },
    { scope: ['markup.bold', 'strong'], settings: { fontStyle: 'bold' } }
  ]
};

export default defineConfig({
  site: 'https://techdufus.com',
  output: 'static',
  integrations: [mdx(), tailwind({ applyBaseStyles: false })],
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: studioCodeTheme,
      wrap: false
    }
  },
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }
});
