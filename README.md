# Personal site

A minimal [Astro](https://astro.build) site: one homepage and one page per blog post.

## Edit your details

Open `src/config.ts` and replace the placeholder name, affiliation and email. This is the only place they are stored.

## Add a post

Create a folder in `src/content/blog/`. The folder name becomes the URL (`/posts/<folder-name>/`). Put `index.md` and any images or other files inside it:

```
src/content/blog/my-first-post/
  index.md
  plot.png
```

`index.md` starts with front matter:

```yaml
---
title: "My first post"
date: 2026-10-17
draft: true   # optional; omit or set to false to publish
---
```

Don't repeat the title as a `# heading` in the body. The page adds it.

In the post body:

- **Images:** `![Alt text](./plot.png)`
- **Equations:** use `$$ ... $$`, inline (`$$x^2$$`) or as a block on its own lines. A single `$` is plain text, so prices like `$5` are safe.
- **Code:** fenced code blocks with a language, e.g. ` ```python `.
- **HTML figures** (e.g. Plotly files): put them in the post folder, such as `figures/chart.html`, then add `<!-- figure: chart.html height=620 -->` on its own line. Any file in the post folder is served next to the post, so `figures/chart.html` is available at `/posts/<folder-name>/figures/chart.html`.

Drafts (`draft: true`) are shown, marked `[draft]`, by `npm run dev`. They are left out of `npm run build` completely, including their asset files.

`src/content/blog/sample-post/` is a sample. Delete it when you no longer need it.

## Preview locally

```sh
npm install
npm run dev       # live site at http://localhost:4321, including drafts
npm run build     # production build into dist/
npm run preview   # serve dist/ locally (no drafts)
```

## Publish with GitHub Pages

Nothing is published until you push to GitHub. When you are ready:

1. Push this folder as the root of a GitHub repository, with default branch `main`. `.github/workflows/deploy.yml` must be at the repository root.
2. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow from the **Actions** tab). The site is then built and deployed.

The workflow reads the Pages settings to choose the URL and base path, so no config changes are needed:

- Repository named `<username>.github.io`: served at `https://<username>.github.io/`.
- Any other repository name: served at `https://<username>.github.io/<repo>/`.
- Custom domain (**Settings → Pages → Custom domain**): served at that domain's root.

To test a subpath build locally: `BASE_PATH=/my-repo npm run build && npm run preview`.
