import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const bundles = {
  home: ['assets/css/base.css','assets/css/components.css','assets/css/responsive.css','assets/css/home-paths.css','assets/css/fantasy-theme.css'],
  adventure: ['assets/css/base.css','assets/css/components.css','assets/css/responsive.css','assets/css/fantasy-theme.css','assets/css/first-adventure.css','assets/css/first-adventure-rules.css','assets/css/learn-modern.css'],
  'character-sheet': ['assets/css/base.css','assets/css/components.css','assets/css/responsive.css','assets/css/fantasy-theme.css','assets/css/character-sheet-guide.css'],
  'one-shots': ['assets/css/base.css','assets/css/components.css','assets/css/responsive.css','assets/css/fantasy-theme.css','assets/css/one-shots.css','assets/css/vault-modern.css'],
  guild: ['assets/css/base.css','assets/css/components.css','assets/css/responsive.css','assets/css/fantasy-theme.css','assets/css/guild-pages.css'],
  form: ['assets/css/base.css','assets/css/components.css','assets/css/responsive.css','assets/css/home-paths.css','assets/css/fantasy-theme.css','assets/css/guild-pages.css'],
  organizer: ['assets/css/base.css','assets/css/components.css','assets/css/responsive.css','assets/css/fantasy-theme.css','assets/css/guild-pages.css','assets/css/organizer.css'],
  core: ['assets/css/base.css','assets/css/components.css','assets/css/fantasy-theme.css']
};

const pageBundleNames = {
  'index.html': 'home',
  'first-adventure.html': 'adventure',
  'character-sheet-guide.html': 'character-sheet',
  'one-shots.html': 'one-shots',
  'guild-hall.html': 'guild',
  'tools.html': 'guild',
  'join.html': 'form',
  'youth-groups.html': 'form',
  'organizer.html': 'organizer',
  '404.html': 'guild',
  'thanks.html': 'core'
};

const stylesheetTag = (file) => `<link rel="stylesheet" href="${file}">`;
const minifyCss = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,])\s*/g, '$1').replace(/;}/g, '}').trim();
const buildDir = 'assets/css/build';
const outputs = new Map();

fs.rmSync(buildDir, { recursive: true, force: true });
fs.mkdirSync(buildDir, { recursive: true });

for (const [name, inputs] of Object.entries(bundles)) {
  try {
    const css = inputs.map((input) => fs.readFileSync(input, 'utf8').trim()).join('\n');
    const minified = minifyCss(css);
    const hash = crypto.createHash('sha256').update(minified).digest('hex').slice(0, 12);
    const output = `${buildDir}/${name}.${hash}.css`;
    outputs.set(name, output);
    fs.writeFileSync(output, `${minified}\n`, 'utf8');
    console.log(`Built ${output} from ${inputs.length} source files.`);
  } catch (error) {
    console.error(`Failed to build ${name}:`, error);
    process.exitCode = 1;
  }
}

const allSourceSheets = [...new Set(Object.values(bundles).flat())];

for (const [page, bundleName] of Object.entries(pageBundleNames)) {
  try {
    let html = fs.readFileSync(page, 'utf8');
    for (const input of allSourceSheets) {
      const tag = stylesheetTag(input);
      html = html.replace(`${tag}\n`, '').replace(tag, '');
    }
    html = html.replace(/\s*<link rel="stylesheet" href="assets\/css\/build\/[^"]+\.css">/g, '');
    html = html.replace(/\s*<style data-production-css>[\s\S]*?<\/style>/, '');
    const output = outputs.get(bundleName);
    if (!output) throw new Error(`No CSS bundle was built for ${bundleName}`);
    const iconMarker = '<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">';
    html = html.replace(iconMarker, `${iconMarker}\n  ${stylesheetTag(output)}`);
    fs.writeFileSync(page, html, 'utf8');
    console.log(`Linked ${output} from ${page}.`);
  } catch (error) {
    console.error(`Failed to rewrite ${page}:`, error);
    process.exitCode = 1;
  }
}
