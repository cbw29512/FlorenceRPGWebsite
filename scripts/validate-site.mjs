import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const pages = ['index.html','first-adventure.html','character-sheet-guide.html','guild-hall.html','one-shots.html','tools.html','join.html','youth-groups.html','thanks.html','404.html'];
const routeFiles = new Map([['/','index.html'],['/learn','first-adventure.html'],['/character-sheet','character-sheet-guide.html'],['/guild','guild-hall.html'],['/adventures','one-shots.html'],['/tools','tools.html'],['/find-table','join.html'],['/youth','youth-groups.html'],['/thanks.html','thanks.html']]);
const errors = [];
const warn = (page, message) => errors.push(`${page}: ${message}`);
const read = (file) => fs.readFileSync(file, 'utf8');
const exists = (file) => fs.existsSync(file);
const productionBuild = exists('assets/css/build');

const validateLink = (page, attrs) => {
  const href = attrs.match(/\shref="([^"]*)"/i)?.[1];
  if (href == null) return warn(page, `anchor missing href: <a${attrs}>`);
  if (!href) warn(page, 'empty anchor href');
  if (/\starget="_blank"/i.test(attrs) && !/\srel="[^"]*noopener[^"]*"/i.test(attrs)) warn(page, `target="_blank" link missing rel="noopener": ${href}`);
  if (/^(?:https?:|mailto:|tel:|#)/i.test(href)) return;
  const clean = href.split('#')[0].split('?')[0];
  if (!clean) return;
  if (routeFiles.has(clean)) return void (!exists(routeFiles.get(clean)) && warn(page, `clean route target missing: ${href}`));
  const resolved = clean.startsWith('/') ? clean.slice(1) : path.normalize(path.join(path.dirname(page), clean));
  if (resolved && !exists(resolved)) warn(page, `broken internal link: ${href} -> ${resolved}`);
};

for (const page of pages) {
  if (!exists(page)) { warn(page, 'missing page'); continue; }
  const html = read(page);
  if (!/<html[^>]+lang="en-US"/i.test(html)) warn(page, 'missing html lang="en-US"');
  if ((html.match(/<title>/gi) || []).length !== 1) warn(page, 'must contain exactly one <title>');
  if ((html.match(/<h1\b/gi) || []).length !== 1) warn(page, 'must contain exactly one <h1>');
  if (!/<meta\s+name="description"\s+content="[^"]+"/i.test(html)) warn(page, 'missing meta description');
  if (!/<meta\s+name="viewport"/i.test(html)) warn(page, 'missing viewport meta');
  if (!/<a\s+class="skip-link"\s+href="#main"/i.test(html)) warn(page, 'missing skip link');
  if (!/<main[^>]+id="main"/i.test(html)) warn(page, 'missing main landmark');

  const ids = [...html.matchAll(/\sid="([^"]+)"/gi)].map((m) => m[1]);
  const duplicates = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  if (duplicates.length) warn(page, `duplicate id(s): ${duplicates.join(', ')}`);

  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    const attrs = match[1];
    if (!/\salt="[^"]*"/i.test(attrs)) warn(page, `image missing alt attribute: <img${attrs}>`);
    if (!/\swidth="\d+"/i.test(attrs) || !/\sheight="\d+"/i.test(attrs)) warn(page, `image missing explicit width/height: <img${attrs}>`);
  }
  for (const match of html.matchAll(/<a\b([^>]*)>/gi)) validateLink(page, match[1]);
  for (const phrase of ['Florence Tabletop Guild','Right To Bear Arms','Right to Bear Arms','community-interest','index.html#interest']) if (html.includes(phrase)) warn(page, `stale public copy detected: "${phrase}"`);

  if (productionBuild) {
    if (!/assets\/css\/build\/[a-z-]+\.[a-f0-9]{12}\.css/.test(html)) warn(page, 'missing content-hashed production CSS');
    if (/href="(?:index|first-adventure|character-sheet-guide|guild-hall|one-shots|tools|join|youth-groups)\.html/i.test(html)) warn(page, 'production output exposes an old .html navigation URL');
  }
}

if (productionBuild) {
  for (const page of pages.filter((p) => p !== 'thanks.html')) {
    const html = read(page);
    for (const label of ['Learn','Tools','Adventures','Guild']) if (!html.includes(`>${label}</a>`)) warn(page, `shared shell missing ${label}`);
  }
}

for (const [formName,file] of Object.entries({'guild-interest':'join.html','youth-group-interest':'youth-groups.html','guild-app-request':'tools.html'})) {
  const html = read(file);
  if (!new RegExp(`<form[^>]+name="${formName}"[^>]+data-netlify="true"`, 'i').test(html)) warn(file, `Netlify form not detectable: ${formName}`);
  if (!new RegExp(`<input[^>]+name="form-name"[^>]+value="${formName}"`, 'i').test(html)) warn(file, `missing hidden form-name for ${formName}`);
}

const home = read('index.html');
if (!home.includes('/tools#request-app') && !home.includes('tools.html#request-app')) warn('index.html', 'homepage app-request entry point is missing');
if (!home.includes('assets/d20-book-hero.svg')) warn('index.html', 'homepage fantasy hero art is missing');
for (const project of ['Character Forge','DM Forge','Guild Vault']) if (!home.includes(project)) warn('index.html', `homepage highlight missing: ${project}`);

const join = read('join.html');
if (!join.includes('name="accessibility-needs"')) warn('join.html', 'optional accessibility/table-needs field is missing');
if (!join.includes('Other TTRPGs — interest only')) warn('join.html', 'other-system interest-only boundary is missing');
const youth = read('youth-groups.html');
if (!youth.includes('name="group-accessibility-needs"')) warn('youth-groups.html', 'optional youth-group venue/accessibility field is missing');
if (!youth.includes('Other TTRPG — interest only')) warn('youth-groups.html', 'youth other-system interest-only boundary is missing');

const tools = read('tools.html');
for (const url of ['https://nothingbutattrpgdiceroller.netlify.app/','https://characterforgerdnd.netlify.app/','https://cbw29512.github.io/monstercardforge/','https://cbw29512.github.io/healingbox/','https://cbw29512.github.io/D20-ironpit/','https://cbw29512.github.io/DNDCards/']) if (!tools.includes(`href="${url}"`)) warn('tools.html', `required tool link missing: ${url}`);
if (!tools.includes('Workshop → Coming Soon → Beta → Live')) warn('tools.html', 'tool release path is missing');

const articleBlocks = [...tools.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/gi)].map((m) => m[0]);
const projectBlock = (name) => articleBlocks.find((block) => block.includes(`<h3>${name}</h3>`)) || '';
for (const [name,url] of [['DM Forge','https://cbw29512.github.io/monstercardforge/'],['Cleric in a Box','https://cbw29512.github.io/healingbox/']]) {
  const block = projectBlock(name);
  if (!block) warn('tools.html', `${name} live project is missing`);
  else { if (!block.includes('status-live')) warn('tools.html', `${name} must be labeled live`); if (!block.includes(url)) warn('tools.html', `${name} verified URL is missing`); }
}
const dungeonCards = projectBlock('Dungeon Cards');
if (!dungeonCards || !dungeonCards.includes('status-beta">Beta · Public Testing</span>') || !dungeonCards.includes('<strong>Beta:</strong>')) warn('tools.html', 'Dungeon Cards Beta boundary is incomplete');
for (const name of ['The Living Table','DungeonMaps','D&amp;D Language Translator','Tabletop Scribe']) {
  const block = projectBlock(name);
  if (!block) warn('tools.html', `${name} Workshop project is missing`);
  else { if (!block.includes('status-planned">In the Workshop</span>')) warn('tools.html', `${name} must be labeled In the Workshop`); if (/<a\b/i.test(block)) warn('tools.html', `${name} must not expose a launch link`); }
}
if (!tools.includes('<h2>TomeForge</h2>') || !tools.includes('Coming Soon · In development · No launch link yet')) warn('tools.html', 'TomeForge Coming Soon boundary is missing');
for (const promise of ['Free','Offline','No account required','Player + DM tomes']) if (!tools.includes(`<span>${promise}</span>`)) warn('tools.html', `TomeForge promise missing: ${promise}`);

const appRequestForm = tools.match(/<form[^>]+name="guild-app-request"[\s\S]*?<\/form>/i)?.[0] || '';
if (!appRequestForm) warn('tools.html', 'Guild app request form is missing');
else for (const field of ['app-idea','audience','problem','must-have','frequency','existing-tool']) if (!appRequestForm.includes(`name="${field}"`)) warn('tools.html', `Guild app request field is missing: ${field}`);

for (const page of ['index.html','guild-hall.html','one-shots.html','tools.html']) {
  const html = read(page);
  if (!html.includes('https://www.buymeacoffee.com/divclass016')) warn(page, 'canonical support link is missing');
  if (!/no ads/i.test(html)) warn(page, 'ad-free statement is missing');
}

const oneShots = read('one-shots.html');
if (!oneShots.includes('Right to OwlBear Arms')) warn('one-shots.html', 'canonical adventure title missing');
const demons = oneShots.match(/<section[^>]+id="demons-wrath"[\s\S]*?<\/section>/i)?.[0] || '';
if (!demons) warn('one-shots.html', "Demon's Wrath preview is missing");
else {
  if (!demons.includes('Coming Soon · Development Preview')) warn('one-shots.html', "Demon's Wrath must remain Coming Soon");
  if (!demons.includes('https://cbw29512.github.io/DNDTeachingAdventureDemonsWrath/')) warn('one-shots.html', "Demon's Wrath preview URL is missing");
  if (/\sdownload(?:\s|>|=)/i.test(demons)) warn('one-shots.html', "Demon's Wrath must not expose a download before release");
  if (!demons.includes('complete Guild package is not released yet')) warn('one-shots.html', "Demon's Wrath release boundary is missing");
}

const zipPath = 'assets/Right_to_OwlBear_Arms_Complete_Adventure_Bundle_v1.1.zip';
const zipSize = 1524131;
const zipSha = 'b2aace66aed7cb0d5d01096d26fe73be998324f0cba4088629b9dea7db184c11';
if (!exists(zipPath)) warn('one-shots.html', `production adventure ZIP missing: ${zipPath}`);
else {
  const bytes = fs.readFileSync(zipPath);
  const actual = crypto.createHash('sha256').update(bytes).digest('hex');
  if (bytes.length !== zipSize) warn('one-shots.html', `adventure ZIP size changed: expected ${zipSize}, got ${bytes.length}`);
  if (actual !== zipSha) warn('one-shots.html', `adventure ZIP checksum changed: expected ${zipSha}, got ${actual}`);
  if (!oneShots.includes(`href="${zipPath}" download`)) warn('one-shots.html', 'verified adventure ZIP is not wired to a same-site download');
}

const learn = read('first-adventure.html');
if (!learn.includes('character-sheet-guide.html') && !learn.includes('/character-sheet')) warn('first-adventure.html', 'annotated character-sheet guide is not linked');
for (const hook of ['data-roll-initiative','data-roll-attack','data-roll-save']) if (!learn.includes(hook)) warn('first-adventure.html', `combat teaching hook missing: ${hook}`);
if (productionBuild && !learn.includes('class="learn-path-nav"')) warn('first-adventure.html', 'guided learning progress navigation is missing');

const intakeJs = read('assets/js/guild-intake.js');
if (!intakeJs.includes('light-tower-environment') || !intakeJs.includes('preview build')) warn('assets/js/guild-intake.js', 'preview-to-production intake isolation is missing');

if (errors.length) {
  console.error('\nSite validation failed:\n');
  for (const error of errors) console.error(`- ${error}`);
  console.error(`\n${errors.length} issue(s) found.`);
  process.exit(1);
}
console.log(`Validated ${pages.length} pages: accessibility, clean routes, shared shell, hashed CSS, forms, release boundaries, preview isolation, adventure integrity, learning flow, and canonical branding all passed.`);
