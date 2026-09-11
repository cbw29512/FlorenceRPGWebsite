import fs from 'node:fs';

const publicPages = [
  { file: 'index.html', route: '/' },
  { file: 'first-adventure.html', route: '/learn' },
  { file: 'character-sheet-guide.html', route: '/character-sheet' },
  { file: 'guild-hall.html', route: '/guild' },
  { file: 'one-shots.html', route: '/adventures' },
  { file: 'tools.html', route: '/tools' },
  { file: 'join.html', route: '/find-table' },
  { file: 'youth-groups.html', route: '/youth' }
];

const allPages = [...publicPages.map((page) => page.file), 'thanks.html', '404.html'];
const context = process.env.CONTEXT || '';
const rawUrl = process.env.URL || '';
const baseUrl = /^https:\/\//i.test(rawUrl) ? rawUrl.replace(/\/$/, '') : '';

const upsertHeadTag = (html, markerPattern, tag) => {
  if (markerPattern.test(html)) return html.replace(markerPattern, tag);
  return html.replace('</head>', `  ${tag}\n</head>`);
};

const markEnvironment = (html, value) => upsertHeadTag(
  html,
  /<meta\s+name="light-tower-environment"\s+content="[^"]*"\s*\/?>/i,
  `<meta name="light-tower-environment" content="${value}">`
);

if (context && context !== 'production') {
  for (const file of allPages) {
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    html = markEnvironment(html, 'preview');
    html = upsertHeadTag(html, /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i, '<meta name="robots" content="noindex,nofollow">');
    fs.writeFileSync(file, html, 'utf8');
  }
  fs.writeFileSync('robots.txt', 'User-agent: *\nDisallow: /\n', 'utf8');
  console.log(`Marked Netlify ${context} deploy as noindex preview.`);
  process.exit(0);
}

if (!baseUrl) {
  console.log('No Netlify production URL detected; canonical/sitemap generation skipped.');
  process.exit(0);
}

const socialImage = `${baseUrl}/assets/d20-book-hero.svg`;

for (const page of publicPages) {
  let html = fs.readFileSync(page.file, 'utf8');
  const canonical = `${baseUrl}${page.route}`;
  html = markEnvironment(html, 'production');
  html = upsertHeadTag(html, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonical}">`);
  html = upsertHeadTag(html, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonical}">`);
  html = upsertHeadTag(html, /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${socialImage}">`);
  html = upsertHeadTag(html, /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${socialImage}">`);
  html = upsertHeadTag(html, /<meta\s+name="twitter:card"\s+content="[^"]*"\s*\/?>/i, '<meta name="twitter:card" content="summary_large_image">');
  fs.writeFileSync(page.file, html, 'utf8');
}

for (const file of ['thanks.html', '404.html']) {
  if (!fs.existsSync(file)) continue;
  const html = markEnvironment(fs.readFileSync(file, 'utf8'), 'production');
  fs.writeFileSync(file, html, 'utf8');
}

const sitemapEntries = publicPages.map((page) => `  <url><loc>${baseUrl}${page.route}</loc></url>`).join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`;
fs.writeFileSync('sitemap.xml', sitemap, 'utf8');
fs.writeFileSync('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`, 'utf8');
console.log(`Generated clean production canonicals, social preview metadata, environment marker, robots.txt, and sitemap.xml for ${baseUrl}.`);
