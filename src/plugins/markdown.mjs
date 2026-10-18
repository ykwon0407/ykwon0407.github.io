// Small Markdown extensions, used by astro.config.mjs.
//  1. $$ ... $$ math is rendered with KaTeX (at build time, no client JS).
//  2. `<!-- figure: name.html height=620 -->` becomes an iframe pointing at
//     figures/name.html next to the post's index.md.
import katex from 'katex';

const FIGURE = /^<!--\s*figure:\s*(\S+)(?:\s+height=(\d+))?\s*-->$/;
const tex = (value, displayMode) => katex.renderToString(value, { displayMode, throwOnError: false });

export const mathAndFigures = {
  name: 'math-and-figures',
  math(node, ctx) {
    ctx.replaceNode(node, { type: 'html', value: tex(node.value, true) });
  },
  inlineMath(node, ctx) {
    ctx.replaceNode(node, { type: 'html', value: tex(node.value, false) });
  },
  html(node, ctx) {
    const m = node.value.trim().match(FIGURE);
    if (!m) return;
    const src = `figures/${m[1]}`;
    ctx.replaceNode(node, {
      type: 'html',
      value: `<iframe class="figure" src="${src}" width="820" height="${m[2] ?? 620}" loading="lazy"></iframe>`,
    });
  },
};
