// All personal details live here. Replace the placeholders.
export const site = {
  name: 'yongchan kwon',
  role: 'Staff ML scientist',
  affiliation: 'Together AI',
  email: 'ykwon@together.ai',
  goal: 'to go beyond what humanity knows...',
};

// Prefix an internal path with the site's base path (needed for GitHub Pages subpaths).
export const withBase = (path = '') =>
  import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
