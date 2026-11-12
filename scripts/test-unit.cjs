const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
// The unit tests read generated extension files that are not tracked in Git.
if (!fs.existsSync('instagram-chrome-eklentisi/content.js')) {
  console.error('Generated extension files are missing. Run "npm run build" first, then repeat the tests.');
  process.exit(1);
}
for (const file of require('./test-cases.cjs')) {
  const result = spawnSync(process.execPath, [file], { stdio: 'inherit' });
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}
