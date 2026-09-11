import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const pages = ['index.html','first-adventure.html','character-sheet-guide.html','guild-hall.html','one-shots.html','tools.html','join.html','youth-groups.html','thanks.html','404.html'];
const routeMap = new Map([
  ['/','index.html'],['/learn','first-adventure.html'],['/learn/','first-adventure.html'],['/character-sheet','character-sheet-guide.html'],['/character-sheet/','character-sheet-guide.html'],
  ['/guild','guild-hall.html'],['/guild/','guild-hall.html'],['/adventures','one-shots.html'],['/adventures/','one-shots.html'],['/tools','tools.html'],['/tools/','tools.html'],['/join','join.html'],['/join/','join.html'],['/youth-groups','youth-groups.html'],['/youth-groups/','youth-groups.html']
]);
const errors = [];
const warn = (page, message) => errors.push(`${page}: ${message}`);
const read = (file) => fs.readFileSync(file, 'utf8');
const exists = (file) => fs.existsSync(file);

const resolveInternal = (page, href) => {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean) return null;
  if (routeMap.has(clean)) return routeMap.get(clean);
  if (clean.startsWith('/')) return clean.slice(1);
  return path.normalize(path.join(path.dirname(page), clean));
};

for (const page of pages) {
  if (!exists(page)) { warn(page, 'missing page'); continue; }
  const html = read(page);
  if (!/<html[^>]+lang="en-US"/i.test(html)) warn(page, 'missing html lang="en-US"');
  if ((html.match(/<title>/gi) || []).length !== 1) warn(page, 'must contain exactly one <title>');
  if ((html.match(/<h1\b/gi) || []).length !== 1) warn(page, 'must contain exactly one <h1>');
  if (!/<meta\s+name="description"\s+content="[^"]+"/i.test(html)) warn(page, 'missing meta description');
  if (!/<meta\s+name="viewport"/i.test(html)) warn(page, 'missing viewport meta');
  if (!/<a\s+class="skip-link"\s+href="#main"/i.test(html)) warn(page, 'missing skip-to-main-content link');
  if (!/<main[^>]+id="main"/i.test(html)) warn(page, 'missing main landmark with id="main"');

  const ids = [...html.matchAll(/\sid="([^"]+)"/gi)].map((match) => match[1]);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicates.length) warn(page, `duplicate id(s): ${duplicates.join(', ')}`);

  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    const attrs = match[1];
    if (!/\salt="[^"]*"/i.test(attrs)) warn(page, `image missing alt attribute: <img${attrs}>`);
    if (!/\swidth="\d+"/i.test(attrs) || !/\sheight="\d+"/i.test(attrs)) warn(page, `image missing explicit width/height: <img${attrs}>`);
  }

  for (const match of html.matchAll(/<a\b([^>]*)>/gi)) {
    const attrs = match[1];
    const href = attrs.match(/\shref="([^"]*)"/i)?.[1];
    if (href == null) { warn(page, `anchor missing href: <a${attrs}>`); continue; }
    if (!href) warn(page, 'empty anchor href');
    if (/\starget="_blank"/i.test(attrs) && !/\srel="[^"]*noopener[^"]*"/i.test(attrs)) warn(page, `target="_blank" link missing rel="noopener": ${href}`);
    if (/^(?:https?:|mailto:|tel:|#)/i.test(href)) continue;
    const resolved = resolveInternal(page, href);
    if (resolved && !exists(resolved)) warn(page, `broken internal link: ${href} -> ${resolved}`);
  }

  for (const phrase of ['Florence Tabletop Guild','Right To Bear Arms','Right to Bear Arms','community-interest','index.html#interest']) {
    if (html.includes(phrase)) warn(page, `stale public copy detected: "${phrase}"`);
  }
}

const formFiles = {'guild-interest':'join.html','youth-group-interest':'youth-groups.html','guild-app-request':'tools.html'};
for (const [formName,file] of Object.entries(formFiles)) {
  const html = exists(file) ? read(file) : '';
  if (!new RegExp(`<form[^>]+name="${formName}"[^>]+data-netlify="true"`,'i').test(html)) warn(file, `Netlify form not detectable: ${formName}`);
  if (!new RegExp(`<input[^>]+name="form-name"[^>]+value="${formName}"`,'i').test(html)) warn(file, `missing hidden form-name for ${formName}`);
}

const home = read('index.html');
if (!home.includes('href="/tools/"')) warn('index.html','homepage must route directly to Guild tools');
if (!home.includes('href="/tools/#request-app"')) warn('index.html','homepage app-request entry point is missing');
if (!home.includes('assets/d20-book-hero.svg')) warn('index.html','homepage fantasy hero art is missing');

const join = read('join.html');
if (!join.includes('name="accessibility-needs"')) warn('join.html','optional accessibility/table-needs field is missing');
if (!join.includes('Other TTRPGs — interest only')) warn('join.html','other-system interest-only boundary is missing');
const youth = read('youth-groups.html');
if (!youth.includes('name="group-accessibility-needs"')) warn('youth-groups.html','optional youth-group venue/accessibility field is missing');
if (!youth.includes('Other TTRPG — interest only')) warn('youth-groups.html','youth other-system interest-only boundary is missing');

const tools = read('tools.html');
for (const toolUrl of ['https://nothingbutattrpgdiceroller.netlify.app/','https://characterforgerdnd.netlify.app/','https://cbw29512.github.io/monstercardforge/','https://cbw29512.github.io/healingbox/','https://cbw29512.github.io/D20-ironpit/','https://cbw29512.github.io/DNDCards/']) {
  if (!tools.includes(`href="${toolUrl}"`)) warn('tools.html',`required public tool link missing: ${toolUrl}`);
}
if (!tools.includes('Workshop → Coming Soon → Beta → Live')) warn('tools.html','tool release path is missing');
for (const liveName of ['Character Forge','DM Forge','Nothing But A TTRPG Dice Roller','Cleric in a Box','The Iron Pit','Guild Vault']) {
  if (!tools.includes(`<h3>${liveName}</h3>`)) warn('tools.html',`${liveName} Live listing is missing`);
}
if (!tools.includes('Beta · Public Testing') || !tools.includes('<h3>Dungeon Cards</h3>') || !tools.includes('<strong>Beta:</strong>')) warn('tools.html','Dungeon Cards Beta boundary is incomplete');
if (!tools.includes('<strong>TomeForge</strong>') || !tools.includes('status-chip soon')) warn('tools.html','TomeForge Coming Soon listing is missing');
for (const workshop of ['The Living Table','DungeonMaps','D&amp;D Language Translator','Tabletop Scribe']) {
  if (!tools.includes(`<strong>${workshop}</strong>`)) warn('tools.html',`${workshop} Workshop listing is missing`);
}

const appRequestForm = tools.match(/<form[^>]+name="guild-app-request"[\s\S]*?<\/form>/i)?.[0] || '';
if (!appRequestForm) warn('tools.html','Guild app request form is missing');
else {
  for (const field of ['app-idea','audience','problem','must-have','frequency','existing-tool']) if (!appRequestForm.includes(`name="${field}"`)) warn('tools.html',`Guild app request field is missing: ${field}`);
  if (!/name="app-idea"[^>]+required/i.test(appRequestForm)) warn('tools.html','app idea must be required');
  if (!/name="audience"[^>]+required/i.test(appRequestForm)) warn('tools.html','app audience must be required');
  if (!/name="problem"[^>]+required/i.test(appRequestForm)) warn('tools.html','app problem statement must be required');
  if (!appRequestForm.includes('data-netlify-honeypot="bot-field"')) warn('tools.html','Guild app request honeypot is missing');
}

for (const page of ['index.html','guild-hall.html','one-shots.html','tools.html']) {
  const html = read(page);
  if (!html.includes('https://www.buymeacoffee.com/divclass016')) warn(page,'canonical Buy Me a Coffee support link is missing');
  if (!/no ads/i.test(html)) warn(page,'ad-free community-support statement is missing');
}

const oneShots = read('one-shots.html');
if (!oneShots.includes('Right to OwlBear Arms')) warn('one-shots.html','canonical adventure title missing: Right to OwlBear Arms');
const demonsWrathPreview = oneShots.match(/<section[^>]+id="demons-wrath"[\s\S]*?<\/section>/i)?.[0] || '';
if (!demonsWrathPreview) warn('one-shots.html',"Demon's Wrath Coming Soon preview is missing");
else {
  if (!demonsWrathPreview.includes('Coming Soon · Development Preview')) warn('one-shots.html',"Demon's Wrath must remain clearly labeled Coming Soon");
  if (!demonsWrathPreview.includes('https://cbw29512.github.io/DNDTeachingAdventureDemonsWrath/')) warn('one-shots.html',"Demon's Wrath preview URL is missing");
  if (/\sdownload(?:\s|>|=)/i.test(demonsWrathPreview)) warn('one-shots.html',"Demon's Wrath preview must not expose a download before release");
  if (!demonsWrathPreview.includes('complete Guild package is not released yet')) warn('one-shots.html',"Demon's Wrath release boundary is missing");
}

const adventureZipPath = 'assets/Right_to_OwlBear_Arms_Complete_Adventure_Bundle_v1.1.zip';
const adventureZipSize = 1524131;
const adventureZipSha256 = 'b2aace66aed7cb0d5d01096d26fe73be998324f0cba4088629b9dea7db184c11';
if (!exists(adventureZipPath)) warn('one-shots.html',`production adventure ZIP missing: ${adventureZipPath}`);
else {
  const adventureZip = fs.readFileSync(adventureZipPath);
  const actualSha256 = crypto.createHash('sha256').update(adventureZip).digest('hex');
  if (adventureZip.length !== adventureZipSize) warn('one-shots.html',`adventure ZIP size changed: expected ${adventureZipSize}, got ${adventureZip.length}`);
  if (actualSha256 !== adventureZipSha256) warn('one-shots.html',`adventure ZIP checksum changed: expected ${adventureZipSha256}, got ${actualSha256}`);
  if (!oneShots.includes(`href="${adventureZipPath}" download`)) warn('one-shots.html','verified adventure ZIP is not wired to a same-site download link');
}

const learn = read('first-adventure.html');
if (!learn.includes('character-sheet-guide.html') && !learn.includes('/character-sheet/')) warn('first-adventure.html','annotated character-sheet guide is not linked');
if (!learn.includes('data-roll-initiative') || !learn.includes('data-roll-attack') || !learn.includes('data-roll-save')) warn('first-adventure.html','combat teaching sequence is incomplete');

if (errors.length) {
  console.error('\nSite validation failed:\n');
  for (const error of errors) console.error(`- ${error}`);
  console.error(`\n${errors.length} issue(s) found.`);
  process.exit(1);
}
console.log(`Validated ${pages.length} pages: accessibility, clean internal routes, release boundaries, Netlify forms, app requests, adventure integrity, social/product navigation, and Guild branding all passed.`);
