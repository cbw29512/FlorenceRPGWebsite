import fs from 'node:fs';

const errors=[]; const warn=(message)=>errors.push(message); const read=(file)=>fs.readFileSync(file,'utf8'); const exists=(file)=>fs.existsSync(file);
const publicPages=['index.html','first-adventure.html','character-sheet-guide.html','guild-hall.html','one-shots.html','tools.html','join.html','youth-groups.html'];

try {
  if(!exists('member.html')) throw new Error('member.html is missing');
  const html=read('member.html');
  if(!/<html[^>]+lang="en-US"/i.test(html)) warn('member.html missing lang="en-US"');
  if((html.match(/<title>/gi)||[]).length!==1) warn('member.html must have one title');
  if((html.match(/<h1\b/gi)||[]).length!==1) warn('member.html must have one h1');
  if(!/<meta\s+name="description"/i.test(html)) warn('member.html missing description');
  if(!/<meta\s+name="robots"\s+content="noindex,nofollow"/i.test(html)) warn('member.html must remain noindex,nofollow');
  if(!/<a\s+class="skip-link"\s+href="#main"/i.test(html)) warn('member.html missing skip link');
  if(!/<main[^>]+id="main"/i.test(html)) warn('member.html missing main landmark');
  for(const hook of ['data-member-login-form','data-member-app','data-member-settings','data-availability-form','data-invitation-list','data-game-list']) if(!html.includes(hook)) warn(`member.html missing ${hook}`);
  for(const script of ['assets/js/member-auth.js','assets/js/member-api.js','assets/js/member-render.js','assets/js/member-console.js']) { if(!exists(script)) warn(`missing member script: ${script}`); if(!html.includes(`src="${script}"`)) warn(`member.html does not load ${script}`); }
  for(const page of publicPages) if(exists(page)&&/href="member\.html(?:[?#][^"]*)?"/i.test(read(page))) warn(`${page} publicly links the private member portal`);
  const meta=read('scripts/build-meta.mjs'); if(/file:\s*['"]member\.html['"]/.test(meta)) warn('member.html must not enter the public sitemap/canonical page list');
  const auth=read('assets/js/member-auth.js');
  if(!auth.includes('sessionStorage')) warn('member auth token must remain session-scoped');
  if(!auth.includes('create_user: false')) warn('member sign-in must not create unapproved accounts');
  if(/service[_-]?role/i.test(auth)) warn('member browser auth must never reference a service-role credential');
  const api=read('assets/js/member-api.js'); if(!api.includes('Authorization')||!api.includes('Bearer')) warn('member API client must send the user bearer token');
  const netlify=read('netlify.toml'); if(!netlify.includes("connect-src 'self' https://vtqoxflirpfhnxzzpxfa.supabase.co")) warn('Netlify CSP must allow the exact Guild Supabase origin');
} catch(error){warn(error.message||String(error));}

if(errors.length){console.error('\nMember validation failed:\n'); for(const error of errors) console.error(`- ${error}`); console.error(`\n${errors.length} issue(s) found.`); process.exit(1);}
console.log('Member validation passed: noindex, hidden navigation, approved-account-only auth, session token handling, local scripts, and Supabase CSP boundary are intact.');
