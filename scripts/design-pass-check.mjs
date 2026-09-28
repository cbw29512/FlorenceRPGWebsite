// Standalone design-pass checks (not part of the Netlify build): node scripts/design-pass-check.mjs
import fs from 'node:fs';
import vm from 'node:vm';

let passed = 0, failed = 0;
const check = (condition, label) => { if (condition) passed += 1; else { failed += 1; console.error(`FAIL: ${label}`); } };
const read = (file) => fs.readFileSync(file, 'utf8');
const BMC = 'https://www.buymeacoffee.com/divclass016';

const shell = read('scripts/build-shell.mjs');
const css = read('assets/css/modern-guild.css');
const buildCss = read('scripts/build-css.mjs');
const adventures = read('one-shots.html');
const configSource = read('assets/js/affiliate-config.js');
const slotsSource = read('assets/js/affiliate-slots.js');

// Header support pill (written into every public page by build-shell.mjs)
check(shell.includes(`<a class="header-support" href="${BMC}" target="_blank" rel="noopener noreferrer"`), 'shared header has the Buy Me a Coffee pill');
check(shell.indexOf('class="header-support"') > shell.indexOf('<nav id="primary-nav"'), 'support pill sits outside the collapsible nav');
check(shell.includes('<small>D&amp;D tools, adventures &amp; tables.</small>'), 'header tagline ampersands are escaped');
check(shell.includes('☕ Support Light Tower</a>'), 'first-pass footer support link is kept');
check(css.includes('.header-support { order:2; margin-left:auto; width:44px; height:44px;'), 'phone pill is a 44px icon button next to Menu');
check(css.includes('.menu-button { order:3; margin-left:.5rem; min-width:44px;'), 'Menu button keeps a 44px tap target');
check(css.includes('.brand { flex:1 1 0; gap:.5rem; min-width:0; }'), 'small-phone brand can shrink instead of wrapping the header');
check(css.includes('.page-footer-nav { display:flex; flex-wrap:wrap; gap:'), 'footer links are spaced on every bundle');
for (const bundle of ['home','adventure','character','oneshots','guild','form','organizer','core']) {
  check(new RegExp(`${bundle}: \\[[^\\]]*modern`).test(buildCss), `modern-guild.css is in the ${bundle} CSS bundle`);
}

// Support cards: never more than one per page
for (const page of ['index.html','first-adventure.html','character-sheet-guide.html','guild-hall.html','one-shots.html','tools.html','join.html','youth-groups.html','404.html','thanks.html']) {
  check((read(page).match(/class="container support-card"/g) || []).length <= 1, `${page} has at most one support card`);
}

// Affiliate slot
check(adventures.includes('<aside id="guild-gear" class="gear-slot" hidden></aside>'), 'hidden empty affiliate slot on the Adventures page');
check(adventures.indexOf('affiliate-config.js') > adventures.indexOf('assets/js/site.js') && adventures.indexOf('affiliate-config.js') < adventures.indexOf('affiliate-slots.js'), 'affiliate scripts load after site.js, config first');
for (const page of ['youth-groups.html','join.html','index.html']) check(!read(page).includes('guild-gear') && !read(page).includes('affiliate-'), `${page} has no affiliate slot`);
check(css.includes('.gear-slot[hidden] { display:none !important; }'), 'hidden slot stays hidden');
check(!/innerHTML/.test(slotsSource), 'affiliate renderer never uses innerHTML');

const sandbox = {window:{}, URL, console};
vm.createContext(sandbox);
vm.runInContext(configSource, sandbox);
vm.runInContext(slotsSource, sandbox);
const config = sandbox.window.GuildAffiliateConfig;
const slots = sandbox.window.GuildAffiliateSlots;
const items = config.groups.flatMap((group) => group.items);
check(config.enabled === false && config.disclosure === '', 'affiliate config is disabled with an empty disclosure');
check(items.length === 9 && items.every((item) => item.url === ''), 'all 9 affiliate URLs are empty');
check(Object.isFrozen(config) && Object.isFrozen(config.groups), 'affiliate config is frozen');
check(slots.renderableGroups(config).length === 0, 'default config renders nothing');
const good = 'https://www.amazon.com/dp/B000000000?tag=realtag-20';
for (const bad of ['', 'http://shop.test/x', 'https://example.com/x', 'https://localhost/x', 'https://shop.test/TODO', 'https://shop.test/?tag=your-tag', 'javascript:alert(1)', 'https://user:pw@shop.test/x', 'not a url']) {
  check(!slots.isRealAffiliateUrl(bad), `rejects ${bad || '(empty)'}`);
}
check(slots.isRealAffiliateUrl(good), 'accepts a real-looking https URL');
const withUrl = {...config, groups: config.groups.map((g, i) => ({...g, items: g.items.map((it, j) => ({...it, url: i === 0 && j === 0 ? good : ''}))}))};
check(slots.renderableGroups({...withUrl, enabled:true, disclosure:''}).length === 0, 'no disclosure, no render');
check(slots.renderableGroups({...withUrl, enabled:false, disclosure:'Disclosure.'}).length === 0, 'disabled, no render');
const ready = slots.renderableGroups({...withUrl, enabled:true, disclosure:'As an Amazon Associate I earn from qualifying purchases.'});
check(ready.length === 1 && ready[0].items.length === 1, 'only real links render');

console.log(`${failed ? 'FAIL' : 'PASS'}: design-pass checks ${passed}/${passed + failed}`);
if (failed) process.exitCode = 1;
