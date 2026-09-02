import fs from 'node:fs';
import path from 'node:path';

const bundles = {
  'assets/css/home-bundle.css': ['assets/css/base.css','assets/css/components.css','assets/css/responsive.css','assets/css/home-paths.css','assets/css/fantasy-theme.css'],
  'assets/css/adventure-bundle.css': ['assets/css/base.css','assets/css/components.css','assets/css/responsive.css','assets/css/first-adventure.css','assets/css/first-adventure-rules.css'],
  'assets/css/character-sheet-bundle.css': ['assets/css/base.css','assets/css/components.css','assets/css/responsive.css','assets/css/character-sheet-guide.css'],
  'assets/css/one-shots-bundle.css': ['assets/css/base.css','assets/css/components.css','assets/css/responsive.css','assets/css/fantasy-theme.css','assets/css/one-shots.css'],
  'assets/css/guild-bundle.css': ['assets/css/base.css','assets/css/components.css','assets/css/responsive.css','assets/css/fantasy-theme.css','assets/css/guild-pages.css'],
  'assets/css/form-bundle.css': ['assets/css/base.css','assets/css/components.css','assets/css/responsive.css','assets/css/home-paths.css','assets/css/fantasy-theme.css','assets/css/guild-pages.css'],
  'assets/css/organizer-bundle.css': ['assets/css/base.css','assets/css/components.css','assets/css/responsive.css','assets/css/fantasy-theme.css','assets/css/guild-pages.css','assets/css/organizer.css'],
  'assets/css/core-bundle.css': ['assets/css/base.css','assets/css/components.css']
};

const pageBundles = {
  'index.html': 'assets/css/home-bundle.css',
  'first-adventure.html': 'assets/css/adventure-bundle.css',
  'character-sheet-guide.html': 'assets/css/character-sheet-bundle.css',
  'one-shots.html': 'assets/css/one-shots-bundle.css',
  'guild-hall.html': 'assets/css/guild-bundle.css',
  'tools.html': 'assets/css/guild-bundle.css',
  'join.html': 'assets/css/form-bundle.css',
  'youth-groups.html': 'assets/css/form-bundle.css',
  'organizer.html': 'assets/css/organizer-bundle.css',
  '404.html': 'assets/css/guild-bundle.css',
  'thanks.html': 'assets/css/core-bundle.css'
};

const stylesheetTag = (file) => `<link rel="stylesheet" href="${file}">`;
const minifyCss = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,])\s*/g, '$1').replace(/;}/g, '}').trim();
const builtCss = new Map();

for (const [output, inputs] of Object.entries(bundles)) {
  try {
    const css = inputs.map((input) => fs.readFileSync(input, 'utf8').trim()).join('\n');
    const minified = minifyCss(css);
    builtCss.set(output, minified);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, `${minified}\n`, 'utf8');
    console.log(`Built ${output} from ${inputs.length} source files.`);
  } catch (error) {
    console.error(`Failed to build ${output}:`, error);
    process.exitCode = 1;
  }
}

for (const [page, output] of Object.entries(pageBundles)) {
  try {
    let html = fs.readFileSync(page, 'utf8');
    for (const input of bundles[output]) {
      const tag = stylesheetTag(input);
      html = html.replace(`${tag}\n`, '').replace(tag, '');
    }
    html = html.replace(`${stylesheetTag(output)}\n`, '').replace(stylesheetTag(output), '');
    html = html.replace(/\s*<style data-production-css>[\s\S]*?<\/style>/, '');
    const css = builtCss.get(output);
    const iconMarker = '<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">';
    if (!css) throw new Error(`No CSS was built for ${output}`);
    html = html.replace(iconMarker, `${iconMarker}\n  <style data-production-css>${css}</style>`);
    html = html.replaceAll('index.html#games', 'index.html#systems').replaceAll('index.html#learn', 'first-adventure.html').replaceAll('index.html#community', 'guild-hall.html').replaceAll('index.html#interest', 'join.html').replace('<button class="menu-button" type="button" aria-expanded="false" aria-controls="primary-nav">','<button class="menu-button" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav">');
    fs.writeFileSync(page, html, 'utf8');
    console.log(`Inlined optimized CSS into ${page}.`);
  } catch (error) {
    console.error(`Failed to rewrite ${page}:`, error);
    process.exitCode = 1;
  }
}
