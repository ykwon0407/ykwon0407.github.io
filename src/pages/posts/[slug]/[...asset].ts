// Serves the non-Markdown files that sit next to a post's index.md
// (e.g. figures/chart.html, data.csv) at /posts/<slug>/<file>.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import type { APIRoute } from 'astro';
import { getPosts } from '../../../posts';

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

function listFiles(dir: string, prefix = ''): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name.startsWith('.')) return [];
    const rel = prefix + e.name;
    return e.isDirectory() ? listFiles(join(dir, e.name), rel + '/') : [rel];
  });
}

export async function getStaticPaths() {
  const posts = await getPosts();
  return posts.flatMap((post) => {
    const dir = join(process.cwd(), dirname(post.filePath!)); // filePath is relative to the project root
    return listFiles(dir)
      .filter((file) => file !== 'index.md')
      .map((file) => ({ params: { slug: post.id, asset: file }, props: { path: join(dir, file) } }));
  });
}

export const GET: APIRoute = ({ props }) =>
  new Response(readFileSync(props.path), {
    headers: { 'Content-Type': TYPES[extname(props.path).toLowerCase()] ?? 'application/octet-stream' },
  });
