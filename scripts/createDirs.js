const fs = require('fs');
const path = require('path');

function walk(dir, baseDir, targetBase) {
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    if (entry.isDirectory()) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(baseDir, fullPath);
      const targetDir = path.join(targetBase, relPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      walk(fullPath, baseDir, targetBase);
    }
  }
}

const appDir = path.join(__dirname, '..', 'src', 'app');
const targetBase = path.join(__dirname, '..', '.next', 'types', 'app');

walk(appDir, appDir, targetBase);
console.log('Successfully pre-created all Next.js type directories');
