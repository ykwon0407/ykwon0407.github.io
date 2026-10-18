import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { mathAndFigures } from './src/plugins/markdown.mjs';

// SITE_URL and BASE_PATH are set by the GitHub Actions workflow.
// Locally they are unset, so the site is served from "/".
export default defineConfig({
  site: process.env.SITE_URL || undefined,
  base: process.env.BASE_PATH || '/',
  markdown: {
    processor: satteri({
      mdastPlugins: [mathAndFigures],
      // Single "$" stays plain text (so prices like "$0.30" are safe).
      // Use $$ ... $$ for equations, inline or block.
      features: { math: { singleDollarTextMath: false } },
    }),
    shikiConfig: { theme: 'github-light' },
  },
});
