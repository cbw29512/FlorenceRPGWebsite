import fs from 'node:fs';
import path from 'node:path';

const bundles = {
  'assets/css/home-bundle.css': [
    'assets/css/base.css',
    'assets/css/components.css',
    'assets/css/responsive.css',
    'assets/css/home-paths.css',
    'assets/css/fantasy-theme.css',
    'assets/css/guild-pages.css'
  ],
  'assets/css/adventure-bundle.css': [
    'assets/css/base.css',
    'assets/css/components.css',
    'assets/css/responsive.css',
    'assets/css/first-adventure.css',
    'assets/css/first-adventure-rules.css'
  ],
  'assets/css/one-shots-bundle.css': [
    'assets/css/base.css',
    'assets/css/components.css',
    'assets/css/responsive.css',
    'assets/css/fantasy-theme.css',
    'assets/css/one-shots.css'
  ],
  'assets/css/guild-bundle.css': [
    'assets/css/base.css',
    'assets/css/components.css',
    'assets/css/responsive.css',
    'assets/css/fantasy-theme.css',
    'assets/css/guild-pages.css'
  ],
  'assets/css/form-bundle.css': [
    'assets/css/base.css',
    'assets/css/components.css',
    'assets/css/responsive.css',
    'assets/css/home-paths.css',
    'assets/css/fantasy-theme.css',
    'assets/css/guild-pages.css'
  ],
  'assets/css/core-bundle.css': [
    'assets/css/base.css',
    'assets/css/components.css'
  ]
};

const pageBundles = {
  'index.html': { output: 'assets/css/home-bundle.css', inputs: bundles['assets/css/home-bundle.css'] },
  'first-adventure.html': { output: 'assets/css/adventure-bundle.css', inputs: bundles['assets/css/adventure-bundle.css'] },
  'one-shots.html': { output: 'assets/css/one-shots-bundle.css', inputs: bundles['assets/css/one-shots-bundle.css'] },
  'guild-hall.html': { output: 'assets/css/guild-bundle.css', inputs: bundles['assets/css/guild-bundle.css'] },
  'tools.html': { output: 'assets/css/guild-bundle.css', inputs: bundles['assets/css/guild-bundle.css'] },
  'join.html': { output: 'assets/css/form-bundle.css', inputs: bundles['assets/css/form-bundle.css'] },
  'youth-groups.html': { output: 'assets/css/form-bundle.css', inputs: bundles['assets/css/form-bundle.css'] },
  '404.html': { output: 'assets/css/guild-bundle.css', inputs: bundles['assets/css/guild-bundle.css'] },
  'thanks.html': { output: 'assets/css/core-bundle.css', inputs: bundles['assets/css/core-bundle.css'] }
};

const stylesheetTag = (file) => `<link rel="stylesheet" href="${file}">`;
const minifyCss = (css) => css
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([{}:;,])\s*/g, '$1')
  .replace(/;}/g, '}')
  .trim();

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

for (const [page, config] of Object.entries(pageBundles)) {
  try {
    let html = fs.readFileSync(page, 'utf8');
    for (const input of config.inputs) {
      const tag = stylesheetTag(input);
      html = html.replace(`${tag}\n`, '').replace(tag, '');
    }
    html = html.replace(`${stylesheetTag(config.output)}\n`, '').replace(stylesheetTag(config.output), '');
    html = html.replace(/\s*<style data-production-css>[\s\S]*?<\/style>/, '');

    const css = builtCss.get(config.output);
    const iconMarker = '<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">';
    if (!css) throw new Error(`No CSS was built for ${config.output}`);
    html = html.replace(iconMarker, `${iconMarker}\n  <style data-production-css>${css}</style>`);

    html = html
      .replaceAll('index.html#games', 'index.html#systems')
      .replaceAll('index.html#learn', 'first-adventure.html')
      .replaceAll('index.html#community', 'guild-hall.html')
      .replaceAll('index.html#interest', 'join.html')
      .replace(
        '<button class="menu-button" type="button" aria-expanded="false" aria-controls="primary-nav">',
        '<button class="menu-button" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav">'
      );

    fs.writeFileSync(page, html, 'utf8');
    console.log(`Inlined optimized CSS into ${page}.`);
  } catch (error) {
    console.error(`Failed to rewrite ${page}:`, error);
    process.exitCode = 1;
  }
}
