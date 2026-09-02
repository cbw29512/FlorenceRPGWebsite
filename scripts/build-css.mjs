import fs from 'node:fs';
import path from 'node:path';

const bundles = {
  'assets/css/home-bundle.css': [
    'assets/css/base.css',
    'assets/css/components.css',
    'assets/css/responsive.css',
    'assets/css/home-paths.css',
    'assets/css/fantasy-theme.css'
  ],
  'assets/css/adventure-bundle.css': [
    'assets/css/base.css',
    'assets/css/components.css',
    'assets/css/responsive.css',
    'assets/css/first-adventure.css',
    'assets/css/first-adventure-rules.css'
  ],
  'assets/css/core-bundle.css': [
    'assets/css/base.css',
    'assets/css/components.css'
  ]
};

const pageBundles = {
  'index.html': {
    output: 'assets/css/home-bundle.css',
    inputs: bundles['assets/css/home-bundle.css']
  },
  'first-adventure.html': {
    output: 'assets/css/adventure-bundle.css',
    inputs: bundles['assets/css/adventure-bundle.css']
  },
  'thanks.html': {
    output: 'assets/css/core-bundle.css',
    inputs: bundles['assets/css/core-bundle.css']
  }
};

const stylesheetTag = (file) => `<link rel="stylesheet" href="${file}">`;

for (const [output, inputs] of Object.entries(bundles)) {
  try {
    const css = inputs
      .map((input) => {
        const source = fs.readFileSync(input, 'utf8').trim();
        return `/* ${input} */\n${source}`;
      })
      .join('\n\n');

    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, `${css}\n`, 'utf8');
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

    const bundleTag = stylesheetTag(config.output);
    const iconMarker = '<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">';
    if (!html.includes(bundleTag)) {
      html = html.replace(iconMarker, `${iconMarker}\n  ${bundleTag}`);
    }

    fs.writeFileSync(page, html, 'utf8');
    console.log(`Rewrote ${page} to use ${config.output}.`);
  } catch (error) {
    console.error(`Failed to rewrite ${page}:`, error);
    process.exitCode = 1;
  }
}
