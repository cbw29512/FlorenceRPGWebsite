import fs from 'node:fs';

const publicPages = [
  'index.html','first-adventure.html','character-sheet-guide.html','guild-hall.html',
  'one-shots.html','tools.html','join.html','youth-groups.html','404.html'
];

const activeFor = (file) => ({
  'first-adventure.html': 'learn',
  'character-sheet-guide.html': 'learn',
  'guild-hall.html': 'guild',
  'one-shots.html': 'adventures',
  'tools.html': 'tools',
  'join.html': 'join',
  'youth-groups.html': 'join'
}[file] || 'home');

const navLink = (key, href, label, active) => `<a href="${href}"${active === key ? ' aria-current="page"' : ''}>${label}</a>`;

const header = (file) => {
  const active = activeFor(file);
  return `<header class="site-header"><div class="container header-inner">
  <a class="brand" href="/" aria-label="Light Tower Table Top Guild home"><img src="assets/guild-mark.svg" alt="" width="62" height="62"><span><strong>Light Tower Table Top Guild</strong><small>Free tools. Table-ready adventures. Real tables.</small></span></a>
  <button class="menu-button" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav"><span aria-hidden="true">☰</span><span>Menu</span></button>
  <nav id="primary-nav" class="site-nav" aria-label="Primary navigation">
    ${navLink('home','/','Home',active)}
    ${navLink('learn','/learn/','Learn',active)}
    ${navLink('tools','/tools/','Tools',active)}
    ${navLink('adventures','/adventures/','Adventures',active)}
    ${navLink('guild','/guild/','Guild',active)}
    <a class="nav-cta" href="/join/"${active === 'join' ? ' aria-current="page"' : ''}>Find a Table</a>
  </nav>
</div></header>`;
};

const footer = `<footer class="site-footer"><div class="container footer-grid">
  <div class="footer-brand"><img src="assets/guild-mark.svg" alt="" width="52" height="52"><div><strong>Light Tower Table Top Guild</strong><span>Find your table. Learn the game. Tell your story.</span></div></div>
  <div class="page-footer-nav"><a href="/learn/">Learn</a><a href="/tools/">Tools</a><a href="/adventures/">Adventures</a><a href="/guild/">Guild</a><a href="/join/">Find a Table</a></div>
  <p>© <span data-year>2026</span> Light Tower Table Top Guild.</p>
</div></footer>`;

for (const file of publicPages) {
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<header class="site-header">[\s\S]*?<\/header>/, header(file));
  html = html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, footer);
  fs.writeFileSync(file, html, 'utf8');
  console.log(`Applied shared Guild shell to ${file}.`);
}
