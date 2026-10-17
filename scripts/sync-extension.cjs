const fs = require('fs');
const path = require('path');

fs.cpSync('instagram-magaza-hazirlik/extension', 'extension', { recursive: true });
console.log('Store extension updated in extension/');

const parentDir = path.resolve('..');
const parentEklenti = path.join(parentDir, 'instagram-chrome-eklentisi');
if (fs.existsSync(parentEklenti)) {
  fs.cpSync('instagram-chrome-eklentisi', parentEklenti, { recursive: true });
  console.log('Synced to parent instagram-chrome-eklentisi');
}
const parentHazirlik = path.join(parentDir, 'instagram-magaza-hazirlik');
if (fs.existsSync(parentHazirlik)) {
  fs.cpSync('instagram-magaza-hazirlik', parentHazirlik, { recursive: true });
  console.log('Synced to parent instagram-magaza-hazirlik');
}
const parentScript = path.join(parentDir, 'instagram-tum-takipleri-birak.js');
if (fs.existsSync(parentScript)) {
  fs.copyFileSync('instagram-tum-takipleri-birak.js', parentScript);
  console.log('Synced to parent instagram-tum-takipleri-birak.js');
}
