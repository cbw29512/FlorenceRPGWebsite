import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const modern = 'assets/css/modern-guild.css';
const bundles = {
  home: ['assets/css/base.css','assets/css/components.css','assets/css/responsive.css','assets/css/home-paths.css','assets/css/fantasy-theme.css',modern],
  adventure: ['assets/css/base.css','assets/css/components.css','assets/css/responsive.css','assets/css/first-adventure.css','assets/css/first-adventure-rules.css',modern],
  character: ['assets/css/base.css','assets/css/components.css','assets/css/responsive.css','assets/css/character-sheet-guide.css',modern],
  oneshots: ['assets/css/base.css','assets/css/components.css','assets/css/responsive.css','assets/css/fantasy-theme.css','assets/css/one-shots.css',modern],
  guild: ['assets/css/base.css','assets/css/components.css','assets/css/responsive.css','assets/css/fantasy-theme.css','assets/css/guild-pages.css',modern],
  form: ['assets/css/base.css','assets/css/components.css','assets/css/responsive.css','assets/css/home-paths.css','assets/css/fantasy-theme.css','assets/css/guild-pages.css',modern],
  organizer: ['assets/css/base.css','assets/css/components.css','assets/css/responsive.css','assets/css/fantasy-theme.css','assets/css/guild-pages.css','assets/css/organizer.css',modern],
  core: ['assets/css/base.css','assets/css/components.css',modern]
};

const pageBundles = {
  'index.html': 'home',
  'first-adventure.html': 'adventure',
  'character-sheet-guide.html': 'character',
  'one-shots.html': 'oneshots',
  'guild-hall.html': 'guild',
  'tools.html': 'guild',
  'join.html': 'form',
  'youth-groups.html': 'form',
  'organizer.html': 'organizer',
  '404.html': 'guild',
  'thanks.html': 'core'
};

const allSourceCss = [...new Set(Object.values(bundles).flat())];
const stylesheetTag = (file) => `<link rel="stylesheet" href="${file}">`;
const minifyCss = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,])\s*/g, '$1').replace(/;}/g, '}').trim();
const outputByBundle = new Map();

for (const [name, inputs] of Object.entries(bundles)) {
  try {
    const css = minifyCss(inputs.map((input) => fs.readFileSync(input, 'utf8').trim()).join('\n'));
    const digest = crypto.createHash('sha256').update(css).digest('hex').slice(0, 12);
    const output = `assets/css/dist/${name}.${digest}.css`;
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, `${css}\n`, 'utf8');
    outputByBundle.set(name, output);
    console.log(`Built ${output} from ${inputs.length} source files.`);
  } catch (error) {
    console.error(`Failed to build ${name}:`, error);
    process.exitCode = 1;
  }
}

for (const [page, bundleName] of Object.entries(pageBundles)) {
  try {
    let html = fs.readFileSync(page, 'utf8');
    for (const input of allSourceCss) html = html.replaceAll(`${stylesheetTag(input)}\n`, '').replaceAll(stylesheetTag(input), '');
    html = html.replace(/\s*<link rel="stylesheet" href="assets\/css\/(?:dist\/)?[^\"]+\.css">/g, '');
    html = html.replace(/\s*<style data-production-css>[\s\S]*?<\/style>/g, '');
    const output = outputByBundle.get(bundleName);
    if (!output) throw new Error(`No CSS output for ${bundleName}`);
    const iconMarker = '<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">';
    html = html.replace(iconMarker, `${iconMarker}\n  ${stylesheetTag(output)}`);
    fs.writeFileSync(page, html, 'utf8');
    console.log(`Linked cacheable ${bundleName} CSS from ${page}.`);
  } catch (error) {
    console.error(`Failed to rewrite ${page}:`, error);
    process.exitCode = 1;
  }
}
