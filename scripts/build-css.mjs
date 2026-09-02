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
