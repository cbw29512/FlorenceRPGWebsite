import fs from 'node:fs';

const publicPages = [
  'index.html',
  'first-adventure.html',
  'character-sheet-guide.html',
  'guild-hall.html',
  'one-shots.html',
  'tools.html',
  'join.html',
  'youth-groups.html',
  '404.html'
];

const activeByPage = {
  'first-adventure.html': 'learn',
  'character-sheet-guide.html': 'learn',
  'tools.html': 'tools',
  'one-shots.html': 'adventures',
  'guild-hall.html': 'guild',
  'join.html': 'find-table'
};

const navItem = (key, href, label, active) => `<a href="${href}"${active === key ? ' aria-current="page"' : ''}>${label}</a>`;

const headerFor = (page) => {
  const active = activeByPage[page] || '';
  return `<header class="site-header"><div class="container header-inner">
  <a class="brand" href="/" aria-label="Light Tower Table Top Guild home"><img src="assets/guild-mark.svg" alt="" width="62" height="62"><span><strong>Light Tower Table Top Guild</strong><small>Tools · Adventures · Tables</small></span></a>
  <button class="menu-button" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav"><span aria-hidden="true">☰</span><span>Menu</span></button>
  <nav id="primary-nav" class="site-nav" aria-label="Primary navigation">${navItem('learn','/learn','Learn',active)}${navItem('tools','/tools','Tools',active)}${navItem('adventures','/adventures','Adventures',active)}${navItem('guild','/guild','Guild',active)}<a class="nav-cta" href="/find-table"${active === 'find-table' ? ' aria-current="page"' : ''}>Find a Table</a></nav>
</div></header>`;
};

const footer = `<footer class="site-footer"><div class="container footer-grid"><div class="footer-brand"><img src="assets/guild-mark.svg" alt="" width="52" height="52"><div><strong>Light Tower Table Top Guild</strong><span>Free tools · Original adventures · Real tables</span></div></div><div class="page-footer-nav"><a href="/learn">Learn</a><a href="/tools">Tools</a><a href="/adventures">Adventures</a><a href="/guild">Guild</a><a href="/find-table">Find a Table</a></div><p>© <span data-year>2026</span> Light Tower Table Top Guild.</p></div></footer>`;

for (const page of publicPages) {
  if (!fs.existsSync(page)) continue;
  let html = fs.readFileSync(page, 'utf8');
  if (/<header class="site-header">[\s\S]*?<\/header>/i.test(html)) {
    html = html.replace(/<header class="site-header">[\s\S]*?<\/header>/i, headerFor(page));
  }
  if (/<footer class="site-footer">[\s\S]*?<\/footer>/i.test(html)) {
    html = html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/i, footer);
  }
  fs.writeFileSync(page, html, 'utf8');
}

console.log(`Built shared public shell into ${publicPages.length} pages.`);
