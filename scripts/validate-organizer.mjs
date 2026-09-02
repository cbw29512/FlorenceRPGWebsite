import fs from 'node:fs';

const errors = [];
const warn = (message) => errors.push(message);
const read = (file) => fs.readFileSync(file, 'utf8');
const exists = (file) => fs.existsSync(file);
const organizerFile = 'organizer.html';
const publicPages = ['index.html','first-adventure.html','character-sheet-guide.html','guild-hall.html','one-shots.html','tools.html','join.html','youth-groups.html'];

try {
  if (!exists(organizerFile)) throw new Error('organizer.html is missing');
  const html = read(organizerFile);
  if (!/<html[^>]+lang="en-US"/i.test(html)) warn('organizer.html missing lang="en-US"');
  if ((html.match(/<title>/gi) || []).length !== 1) warn('organizer.html must have one title');
  if ((html.match(/<h1\b/gi) || []).length !== 1) warn('organizer.html must have one h1');
  if (!/<meta\s+name="description"/i.test(html)) warn('organizer.html missing description');
  if (!/<meta\s+name="robots"\s+content="noindex,nofollow"/i.test(html)) warn('organizer.html must remain noindex,nofollow');
  if (!/<a\s+class="skip-link"\s+href="#main"/i.test(html)) warn('organizer.html missing skip link');
  if (!/<main[^>]+id="main"/i.test(html)) warn('organizer.html missing main landmark');

  const requiredHooks = ['data-organizer-login-form','data-organizer-app','data-organizer-status','data-proposal-form','data-adult-list','data-youth-list','data-proposal-list'];
  for (const hook of requiredHooks) if (!html.includes(hook)) warn(`organizer.html missing ${hook}`);

  const scripts = ['assets/js/organizer-auth.js','assets/js/organizer-api.js','assets/js/organizer-render.js','assets/js/organizer-console.js'];
  for (const script of scripts) {
    if (!exists(script)) warn(`missing organizer script: ${script}`);
    if (!html.includes(`src="${script}"`)) warn(`organizer.html does not load ${script}`);
  }

  for (const page of publicPages) {
    if (!exists(page)) continue;
    if (/href="organizer\.html(?:[?#][^"]*)?"/i.test(read(page))) warn(`${page} publicly links the private organizer console`);
  }

  const netlify = read('netlify.toml');
  if (!netlify.includes("connect-src 'self' https://vtqoxflirpfhnxzzpxfa.supabase.co")) warn('Netlify CSP does not allow the exact Guild Supabase origin');
  if (/connect-src[^\n"]*\*/i.test(netlify)) warn('Netlify CSP connect-src must not use a wildcard');

  const auth = read('assets/js/organizer-auth.js');
  if (!auth.includes('sessionStorage')) warn('organizer auth token must remain session-scoped');
  if (/service[_-]?role/i.test(auth)) warn('organizer browser auth must never reference a service-role credential');

  const api = read('assets/js/organizer-api.js');
  if (!api.includes('Authorization') || !api.includes('Bearer')) warn('organizer API client must send the user bearer token');
} catch (error) {
  warn(error.message || String(error));
}

if (errors.length) {
  console.error('\nOrganizer validation failed:\n');
  for (const error of errors) console.error(`- ${error}`);
  console.error(`\n${errors.length} issue(s) found.`);
  process.exit(1);
}

console.log('Organizer validation passed: noindex, hidden navigation, auth hooks, session token handling, local scripts, and exact Supabase CSP allowlist are intact.');
