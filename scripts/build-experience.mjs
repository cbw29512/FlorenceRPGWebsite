import fs from 'node:fs';

const learnFile = 'first-adventure.html';
if (fs.existsSync(learnFile)) {
  let html = fs.readFileSync(learnFile, 'utf8');
  if (!html.includes('class="learn-path-nav"')) {
    const marker = '</section>\n\n  <section class="section paper" id="party">';
    const nav = `</section>\n\n  <nav class="learn-path-nav" aria-label="Learn D&D progress"><div class="container"><a href="#party"><b>1</b> Meet the party</a><a href="#rules"><b>2</b> Learn the loop</a><a href="#adventure"><b>3</b> Follow the adventure</a><a href="#combat-lab"><b>4</b> Play a combat round</a><a href="/character-sheet"><b>5</b> Read the sheet</a></div></nav>\n\n  <section class="section paper" id="party">`;
    if (html.includes(marker)) html = html.replace(marker, nav);
  }
  html = html.replace('<section class="combat-lab" data-rule-lab', '<section class="combat-lab" id="combat-lab" data-rule-lab');
  fs.writeFileSync(learnFile, html, 'utf8');
}

const sheetFile = 'character-sheet-guide.html';
if (fs.existsSync(sheetFile)) {
  let html = fs.readFileSync(sheetFile, 'utf8');
  html = html.replace(
    '<a class="button button-secondary" href="tools.html">Open Character Forge</a>',
    '<a class="button button-secondary" href="https://characterforgerdnd.netlify.app/" target="_blank" rel="noopener noreferrer">Open Character Forge</a>'
  );
  fs.writeFileSync(sheetFile, html, 'utf8');
}

console.log('Applied guided learning and targeted UX build fixes.');
