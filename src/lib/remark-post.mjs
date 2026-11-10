/*
  Remark plugins for the content collections (wired in astro.config.mjs; plain .mjs so the config
  can import it without a build step).

  remarkBodyTitle  The page layout prints the title from frontmatter, so a body never owns an <h1>:
                     a leading `# …` that repeats the title is dropped;
                     a leading `# …` that says something else becomes the standfirst (p.standfirst);
                     any later `# …` becomes an <h2>, which also puts it in the contents list.
  remarkFigures    An image paragraph followed by a bold `Figure N - caption` line (same paragraph
                   or the next one) becomes <figure> + <figcaption>.
*/

const text = (node) => ('value' in node ? node.value : (node.children ?? []).map(text).join(''));
const key = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
const NOT_CONTENT = new Set(['yaml', 'toml', 'mdxjsEsm']);

export function remarkBodyTitle() {
  return (tree, file) => {
    const title = file.data.astro?.frontmatter?.title;
    const lead = tree.children.findIndex((node) => !NOT_CONTENT.has(node.type));
    tree.children = tree.children.flatMap((node, i) => {
      if (node.type !== 'heading' || node.depth !== 1) return [node];
      if (i !== lead) return [{ ...node, depth: 2 }];
      if (typeof title === 'string' && key(text(node)) === key(title)) return [];
      return [{ type: 'paragraph', children: node.children, data: { hProperties: { className: ['standfirst'] } } }];
    });
  };
}

const isBlank = (node) => node.type === 'break' || (node.type === 'text' && !node.value.trim());
const CAPTION = /^(Figure\s+\d+(?:\s*[-–]\s*\d+)?)\s*[-–:]\s*(.+)$/is;

/** The caption's children when `node` is a bold line starting "Figure N", else null. */
function caption(node) {
  if (node?.type !== 'strong') return null;
  const match = CAPTION.exec(text(node));
  if (!match) return null;
  const plain = node.children.length === 1 && node.children[0].type === 'text';
  if (!plain) return node.children;
  return [
    { type: 'strong', children: [{ type: 'text', value: match[1] }], data: { hName: 'span', hProperties: { className: ['fig-no'] } } },
    { type: 'text', value: match[2] }
  ];
}

export function remarkFigures() {
  return (tree) => {
    const out = [];
    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];
      const parts = node.type === 'paragraph' ? node.children.filter((child) => !isBlank(child)) : [];
      const images = parts.filter((child) => child.type === 'image');
      const rest = parts.slice(images.length);
      const imagesFirst = images.length > 0 && parts.slice(0, images.length).every((child) => child.type === 'image');

      let cap = null;
      if (imagesFirst && rest.length === 1) cap = caption(rest[0]);
      else if (imagesFirst && rest.length === 0) {
        const next = tree.children[i + 1];
        const only = next?.type === 'paragraph' && next.children.length === 1 ? next.children[0] : null;
        cap = caption(only);
        if (cap) i++; // the caption paragraph is folded into the figure
      }
      if (!cap) {
        out.push(node);
        continue;
      }
      out.push({
        type: 'paragraph',
        data: { hName: 'figure' },
        children: [...images, { type: 'paragraph', data: { hName: 'figcaption' }, children: cap }]
      });
    }
    tree.children = out;
  };
}
