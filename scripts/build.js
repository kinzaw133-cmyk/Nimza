process.env.NEXT_TELEMETRY_DISABLED = '1';
require('./createDirs');
const { execSync } = require('child_process');
console.log('Starting optimized Next.js build...');
execSync('npx next build', { stdio: 'inherit' });
console.log('Build completed successfully.');
