const { spawnSync } = require('node:child_process');
for (const file of require('./test-cases.cjs')) {
  const result = spawnSync(process.execPath, [file], { stdio: 'inherit' });
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}
