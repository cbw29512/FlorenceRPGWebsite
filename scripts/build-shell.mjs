import fs from 'node:fs';

const publicPages = ['index.html','first-adventure.html','character-sheet-guide.html','guild-hall.html','one-shots.html','tools.html','join.html','youth-groups.html','404.html'];
const activeFor = (file) => ({
  'first-adventure.html':'start',
  'character-sheet-guide.html':'start',
  'one-shots.html':'adventures',
  'tools.html':'tools',
  'join.html':'join',
  'youth-groups.html':'join'
}[file] || '');
const pageLabel = (file) => ({
  'first-adventure.html':'Start Here',
  'character-sheet-guide.html':'Character Sheet Guide',
  'guild-hall.html':'About Light Tower',
  'one-shots.html':'Adventures',
  'tools.html':'Tools',
  'join.html':'Find a Table',
  'youth-groups.html':'Youth Groups'
}[file] || '');
const navLink = (key, href, label, active) => `<a href="${href}"${active === key ? ' aria-current="page"' : ''}>${label}</a>`;

const header = (file) => {
  const active = activeFor(file);
  return `<header class="site-header"><div class="container header-inner">
  <a class="brand" href="/" aria-label="Light Tower Table Top Guild home"><img src="assets/guild-mark.svg" alt="" width="62" height="62"><span><strong>Light Tower Table Top Guild</strong><small>D&amp;D tools, adventures &amp; tables.</small></span></a>
  <button class="menu-button" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav"><span aria-hidden="true">☰</span><span>Menu</span></button>
  <nav id="primary-nav" class="site-nav" aria-label="Primary navigation">${navLink('start','/learn/','Start Here',active)}${navLink('tools','/tools/','Tools',active)}${navLink('adventures','/adventures/','Adventures',active)}<a class="nav-cta" href="/join/"${active === 'join' ? ' aria-current="page"' : ''}>Find a Table</a></nav>
</div></header>`;
};

const footer = `<footer class="site-footer"><div class="container footer-grid"><div class="footer-brand"><img src="assets/guild-mark.svg" alt="" width="52" height="52"><div><strong>Light Tower Table Top Guild</strong><span>Find your table. Learn the game. Tell your story.</span></div></div><div class="page-footer-nav"><a href="/">Home</a><a href="/learn/">Start Here</a><a href="/tools/">Tools</a><a href="/adventures/">Adventures</a><a href="/join/">Find a Table</a><a href="/guild/">About Light Tower</a><a href="/youth-groups/">Youth Groups</a></div><p>© <span data-year>2026</span> Light Tower Table Top Guild.</p></div></footer>`;

const breadcrumb = (file) => {
  const label = pageLabel(file);
  if (!label || file === 'index.html' || file === '404.html') return '';
  return `<div class="breadcrumb-wrap"><div class="container"><nav class="breadcrumb-nav" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">›</span><span aria-current="page">${label}</span></nav></div></div>`;
};

const routeReplacements = [
  [/href="index\.html"/g,'href="/"'],[/href="first-adventure\.html"/g,'href="/learn/"'],[/href="guild-hall\.html"/g,'href="/guild/"'],[/href="one-shots\.html"/g,'href="/adventures/"'],[/href="tools\.html"/g,'href="/tools/"'],[/href="join\.html"/g,'href="/join/"'],[/href="youth-groups\.html"/g,'href="/youth-groups/"'],[/href="character-sheet-guide\.html"/g,'href="/character-sheet/"']
];

const learningProgress = `<div class="container"><nav class="learning-progress" aria-label="Beginner learning path"><a href="#party">1 · Choose a hero</a><a href="#rules">2 · Learn the core loop</a><a href="#adventure">3 · Play the story</a><a href="#combat-lab-title">4 · Run combat</a><a href="/character-sheet/">5 · Read the sheet</a><a href="https://characterforgerdnd.netlify.app/" target="_blank" rel="noopener noreferrer">6 · Build your own</a></nav></div>`;

for (const file of publicPages) {
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<header class="site-header">[\s\S]*?<\/header>/, header(file));
  html = html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, footer);
  html = html.replace(/<div class="breadcrumb-wrap">[\s\S]*?<\/div><\/div>/, '');
  const crumb = breadcrumb(file);
  if (crumb) html = html.replace('</header>', `</header>\n${crumb}`);
  for (const [pattern,replacement] of routeReplacements) html = html.replace(pattern,replacement);
  html = html.replace(/<a class="button button-secondary" href="\/tools\/">Open Character Forge<\/a>/, '<a class="button button-secondary" href="https://characterforgerdnd.netlify.app/" target="_blank" rel="noopener noreferrer">Open Character Forge</a>');
  if (file === 'first-adventure.html' && !html.includes('class="learning-progress"')) {
    html = html.replace('</section>\n\n  <section class="section paper" id="party">', `${learningProgress}</section>\n\n  <section class="section paper" id="party">`);
  }
  fs.writeFileSync(file, html, 'utf8');
  console.log(`Applied simplified Guild navigation and clean routes to ${file}.`);
}
