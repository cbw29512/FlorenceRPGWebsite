import fs from 'node:fs';
import path from 'node:path';

const pages = [
  'index.html',
  'first-adventure.html',
  'guild-hall.html',
  'one-shots.html',
  'tools.html',
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

const index = exists('index.html') ? read('index.html') : '';
for (const formName of ['guild-interest', 'youth-group-interest']) {
  const formPattern = new RegExp(`<form[^>]+name="${formName}"[^>]+data-netlify="true"`, 'i');
  const hiddenPattern = new RegExp(`<input[^>]+name="form-name"[^>]+value="${formName}"`, 'i');
  if (!formPattern.test(index)) warn('index.html', `Netlify form not detectable: ${formName}`);
  if (!hiddenPattern.test(index)) warn('index.html', `missing hidden form-name for ${formName}`);
}

const oneShots = exists('one-shots.html') ? read('one-shots.html') : '';
if (!oneShots.includes('Right to OwlBear Arms')) warn('one-shots.html', 'canonical adventure title missing: Right to OwlBear Arms');

if (errors.length) {
  console.error('\nSite validation failed:\n');
  for (const error of errors) console.error(`- ${error}`);
  console.error(`\n${errors.length} issue(s) found.`);
  process.exit(1);
}

console.log(`Validated ${pages.length} pages: internal links, duplicate IDs, metadata, images, external-link safety, Netlify forms, and canonical branding all passed.`);
