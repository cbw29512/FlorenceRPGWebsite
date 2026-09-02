import fs from 'node:fs';
import path from 'node:path';

const directory = '.lighthouseci';
const files = fs.existsSync(directory)
  ? fs.readdirSync(directory).filter((name) => name.endsWith('.json'))
  : [];

for (const file of files) {
  try {
    const report = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
    if (!report.categories || !report.audits) continue;

    console.log(`\n=== ${report.finalUrl || report.requestedUrl || file} ===`);

    for (const categoryName of ['performance', 'accessibility', 'best-practices', 'seo']) {
      const category = report.categories[categoryName];
      if (!category) continue;
      console.log(`${category.title}: ${Math.round((category.score ?? 0) * 100)}`);

      const auditIds = new Set((category.auditRefs || []).map((ref) => ref.id));
      const failures = [...auditIds]
        .map((id) => report.audits[id])
        .filter((audit) => audit && typeof audit.score === 'number' && audit.score < 1)
        .sort((a, b) => (a.score ?? 0) - (b.score ?? 0));

      for (const audit of failures) {
        console.log(`  FAIL ${audit.id}: ${audit.title} (score ${audit.score})`);
        if (audit.displayValue) console.log(`       ${audit.displayValue}`);
        const items = audit.details?.items;
        if (Array.isArray(items)) {
          for (const item of items.slice(0, 8)) {
            const detail = item.node?.selector || item.node?.snippet || item.url || item.source || item.label;
            if (detail) console.log(`       -> ${String(detail).replace(/\s+/g, ' ').slice(0, 220)}`);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Could not summarize ${file}:`, error.message);
  }
}
