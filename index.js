#!/usr/bin/env node
// index.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ---------------------------------------------------------------
// 1. Silence ALL deprecation warnings (punycode, etc.)
// ---------------------------------------------------------------
process.noDeprecation = true;

// ---------------------------------------------------------------
// 2. Install pdfjs-dist ONLY ONCE (first run)
// ---------------------------------------------------------------
function ensurePdfJsOnce() {
  const marker = path.join(__dirname, 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.js');
  const lockFile = path.join(__dirname, '.pdfjs-installed');

  if (fs.existsSync(marker) || fs.existsSync(lockFile)) {
    return; // Already installed or tried
  }

  console.log('First-time setup: Installing pdfjs-dist@3.11.174...');
  try {
    execSync('npm install pdfjs-dist@3.11.174 --save --loglevel=error', {
      stdio: 'ignore',
      cwd: __dirname,
      timeout: 30000, // 30s max
    });
    fs.writeFileSync(lockFile, 'installed', 'utf-8');
    console.log('pdfjs-dist installed.');
  } catch (err) {
    console.error('Failed to install pdfjs-dist. Run manually: npm install pdfjs-dist@3.11.174');
    process.exit(1);
  }
}
ensurePdfJsOnce();

// ---------------------------------------------------------------
// 3. Import parser
// ---------------------------------------------------------------
const parseDocument = require('./parseDocument');

// ---------------------------------------------------------------
// 4. CLI + Save + Clean Exit
// ---------------------------------------------------------------
(async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('Usage: node index.js <input-file>');
    process.exit(1);
  }

  const inputPath = path.resolve(fileArg);
  if (!fs.existsSync(inputPath)) {
    console.error('File not found:', inputPath);
    process.exit(1);
  }

  try {
    const result = await parseDocument(inputPath);

    const outDir = path.join(__dirname, 'examples', 'output');
    fs.mkdirSync(outDir, { recursive: true });

    const base = path.basename(inputPath, path.extname(inputPath));
    const outPath = path.join(outDir, `${base}.json`);

    fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`Saved: ${path.relative(process.cwd(), outPath)}`);

    // Clean exit
    process.exit(0);
  } catch (err) {
    console.error('Parsing failed:', err.message);
    process.exit(1);
  }
})();