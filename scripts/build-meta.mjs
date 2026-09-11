import fs from 'node:fs';

const publicPages = [
  { file: 'index.html', route: '/' },
  { file: 'first-adventure.html', route: '/learn/' },
  { file: 'character-sheet-guide.html', route: '/character-sheet/' },
  { file: 'guild-hall.html', route: '/guild/' },
  { file: 'one-shots.html', route: '/adventures/' },
  { file: 'tools.html', route: '/tools/' },
  { file: 'join.html', route: '/join/' },
  { file: 'youth-groups.html', route: '/youth-groups/' }
];

const allPages = [...publicPages.map((page) => page.file), 'thanks.html', '404.html'];
const context = process.env.CONTEXT || '';
const rawUrl = process.env.URL || '';
const baseUrl = /^https:\/\//i.test(rawUrl) ? rawUrl.replace(/\/$/, '') : '';

const upsertHeadTag = (html, markerPattern, tag) => {
  if (markerPattern.test(html)) return html.replace(markerPattern, tag);
  return html.replace('</head>', `  ${tag}\n</head>`);
};

if (context && context !== 'production') {
  for (const file of allPages) {
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    html = upsertHeadTag(html, /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i, '<meta name="robots" content="noindex,nofollow">');
    fs.writeFileSync(file, html, 'utf8');
  }
  fs.writeFileSync('robots.txt', 'User-agent: *\nDisallow: /\n', 'utf8');
  console.log(`Marked Netlify ${context} deploy as noindex.`);
  process.exit(0);
}

if (!baseUrl) {
  console.log('No Netlify production URL detected; canonical/sitemap generation skipped.');
  process.exit(0);
}

for (const page of publicPages) {
  let html = fs.readFileSync(page.file, 'utf8');
  const canonical = `${baseUrl}${page.route}`;
  const socialImage = `${baseUrl}/assets/d20-book-hero.svg`;
  html = upsertHeadTag(html, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonical}">`);
  html = upsertHeadTag(html, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonical}">`);
  html = upsertHeadTag(html, /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${socialImage}">`);
  html = upsertHeadTag(html, /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/i, '<meta property="og:image:alt" content="A gold and purple d20 above an open book for Light Tower Table Top Guild">');
  html = upsertHeadTag(html, /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${socialImage}">`);
  fs.writeFileSync(page.file, html, 'utf8');
}

const sitemapEntries = publicPages.map((page) => `  <url><loc>${baseUrl}${page.route}</loc></url>`).join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`;
fs.writeFileSync('sitemap.xml', sitemap, 'utf8');
fs.writeFileSync('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`, 'utf8');
console.log(`Generated clean production canonical URLs, social preview metadata, robots.txt, and sitemap.xml for ${baseUrl}.`);
