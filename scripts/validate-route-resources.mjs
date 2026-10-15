// Contract: rewritten pages share /assets; their visible URL must not move assets into a route folder.
import fs from 'node:fs';
import path from 'node:path';

try {
  const configuration = fs.readFileSync('netlify.toml', 'utf8');
  const routes = [['/', 'index.html']];
  const errors = [];
  for (const block of configuration.split('[[redirects]]').slice(1)) {
    const from = block.match(/from\s*=\s*"([^"]+)"/)?.[1];
    const to = block.match(/to\s*=\s*"([^"]+)"/)?.[1];
    const status = Number(block.match(/status\s*=\s*(\d+)/)?.[1]);
    if (status >= 300 && from?.replace(/\/$/, '') === to?.replace(/\/$/, ''))
      errors.push(`Unsupported slash-only redirect: ${from} -> ${to}`);
    if (status === 200 && to?.endsWith('.html')) {
      routes.push([from, to.slice(1)], [from.replace(/\/$/, ''), to.slice(1)]);
    }
  }
  let checked = 0;
  for (const [route, file] of routes) {
    const html = fs.readFileSync(file, 'utf8');
    for (const match of html.matchAll(/\b(?:src|href|action)=["']([^"']+)["']/g)) {
      const reference = match[1];
      if (!/^(?:\.?\/?assets\/)/.test(reference)) continue;
      const resolved = new URL(reference, `https://guild.example${route || '/'}`);
      if (!resolved.pathname.startsWith('/assets/'))
        errors.push(`${route}: ${reference} resolves to ${resolved.pathname}`);
      if (!fs.existsSync(path.join('.', decodeURIComponent(resolved.pathname.slice(1)))))
        errors.push(`${route}: missing public resource ${resolved.pathname}`);
      checked++;
    }
  }
  if (errors.length) throw Error(errors.join('\n'));
  console.log(`Validated ${checked} resource references across ${routes.length} public route variants.`);
} catch (error) {
  console.error('Clean-route resource validation failed:', error.message);
  process.exitCode = 1;
}
