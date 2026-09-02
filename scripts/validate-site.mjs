import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const pages = [
  'index.html',
  'first-adventure.html',
  'character-sheet-guide.html',
  'guild-hall.html',
  'one-shots.html',
  'tools.html',
  'join.html',
  'youth-groups.html',
  'thanks.html',
  '404.html'
];

const errors = [];
const warn = (page, message) => errors.push(`${page}: ${message}`);
const read = (file) => fs.readFileSync(file, 'utf8');
const exists = (file) => fs.existsSync(file);

for (const page of pages) {
  if (!exists(page)) {
    warn(page, 'missing page');
    continue;
  }

  const html = read(page);

  if (!/<html[^>]+lang="en-US"/i.test(html)) warn(page, 'missing html lang="en-US"');
  if ((html.match(/<title>/gi) || []).length !== 1) warn(page, 'must contain exactly one <title>');
  if ((html.match(/<h1\b/gi) || []).length !== 1) warn(page, 'must contain exactly one <h1>');
  if (!/<meta\s+name="description"\s+content="[^"]+"/i.test(html)) warn(page, 'missing meta description');
  if (!/<meta\s+name="viewport"/i.test(html)) warn(page, 'missing viewport meta');

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
    const hrefMatch = attrs.match(/\shref="([^"]*)"/i);
    if (!hrefMatch) {
      warn(page, `anchor missing href: <a${attrs}>`);
      continue;
    }
    const href = hrefMatch[1];
    if (!href) warn(page, 'empty anchor href');

    if (/\starget="_blank"/i.test(attrs) && !/\srel="[^"]*noopener[^"]*"/i.test(attrs)) {
      warn(page, `target="_blank" link missing rel="noopener": ${href}`);
    }

    if (/^(?:https?:|mailto:|tel:|#)/i.test(href)) continue;
    const clean = href.split('#')[0].split('?')[0];
    if (!clean || clean === '/') continue;
    const resolved = clean.startsWith('/') ? clean.slice(1) : path.normalize(path.join(path.dirname(page), clean));
    if (!exists(resolved)) warn(page, `broken internal link: ${href} -> ${resolved}`);
  }

  const forbidden = [
    'Florence Tabletop Guild',
    'Right To Bear Arms',
    'Right to Bear Arms',
    'community-interest'
  ];
  for (const phrase of forbidden) {
    if (html.includes(phrase)) warn(page, `stale public copy detected: "${phrase}"`);
  }
}

const formFiles = {
  'guild-interest': 'join.html',
  'youth-group-interest': 'youth-groups.html'
};

for (const [formName, file] of Object.entries(formFiles)) {
  const html = exists(file) ? read(file) : '';
  const formPattern = new RegExp(`<form[^>]+name="${formName}"[^>]+data-netlify="true"`, 'i');
  const hiddenPattern = new RegExp(`<input[^>]+name="form-name"[^>]+value="${formName}"`, 'i');
  if (!formPattern.test(html)) warn(file, `Netlify form not detectable: ${formName}`);
  if (!hiddenPattern.test(html)) warn(file, `missing hidden form-name for ${formName}`);
}

const oneShots = exists('one-shots.html') ? read('one-shots.html') : '';
if (!oneShots.includes('Right to OwlBear Arms')) warn('one-shots.html', 'canonical adventure title missing: Right to OwlBear Arms');

const adventureZipPath = 'assets/Right_to_OwlBear_Arms_Complete_Adventure_Bundle_v1.1.zip';
const adventureZipSize = 1524131;
const adventureZipSha256 = 'b2aace66aed7cb0d5d01096d26fe73be998324f0cba4088629b9dea7db184c11';
if (!exists(adventureZipPath)) {
  warn('one-shots.html', `production adventure ZIP missing: ${adventureZipPath}`);
} else {
  const adventureZip = fs.readFileSync(adventureZipPath);
  const actualSha256 = crypto.createHash('sha256').update(adventureZip).digest('hex');
  if (adventureZip.length !== adventureZipSize) {
    warn('one-shots.html', `adventure ZIP size changed: expected ${adventureZipSize}, got ${adventureZip.length}`);
  }
  if (actualSha256 !== adventureZipSha256) {
    warn('one-shots.html', `adventure ZIP checksum changed: expected ${adventureZipSha256}, got ${actualSha256}`);
  }
  if (!oneShots.includes(`href="${adventureZipPath}" download`)) {
    warn('one-shots.html', 'verified adventure ZIP is not wired to a same-site download link');
  }
}

const learn = exists('first-adventure.html') ? read('first-adventure.html') : '';
if (!learn.includes('character-sheet-guide.html')) warn('first-adventure.html', 'annotated character-sheet guide is not linked');
if (!learn.includes('data-roll-initiative') || !learn.includes('data-roll-attack') || !learn.includes('data-roll-save')) {
  warn('first-adventure.html', 'combat teaching sequence is incomplete');
}

if (errors.length) {
  console.error('\nSite validation failed:\n');
  for (const error of errors) console.error(`- ${error}`);
  console.error(`\n${errors.length} issue(s) found.`);
  process.exit(1);
}

console.log(`Validated ${pages.length} pages: internal links, duplicate IDs, metadata, images, external-link safety, Netlify forms, learning flow, adventure download integrity, and canonical branding all passed.`);
