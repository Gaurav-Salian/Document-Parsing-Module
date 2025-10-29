// parsePDF.js
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const path = require('path');
const { extractTablesFromText } = require('./utils/tableExtractor');

// --- 1. Worker ---
pdfjsLib.GlobalWorkerOptions.workerSrc =
  require.resolve('pdfjs-dist/legacy/build/pdf.worker.js');

// --- 2. Node.js mode (no DOM, no canvas, no font download) ---
const stdFontsDir = path.resolve(__dirname, 'node_modules', 'pdfjs-dist', 'standard_fonts');
const cMapsDir = path.resolve(__dirname, 'node_modules', 'pdfjs-dist', 'cmaps');

pdfjsLib.GlobalWorkerOptions.standardFontDataUrl = stdFontsDir + '/';
pdfjsLib.GlobalWorkerOptions.cMapUrl = cMapsDir + '/';
pdfjsLib.GlobalWorkerOptions.cMapPacked = true;

// Disable everything that needs canvas/DOM
pdfjsLib.GlobalWorkerOptions.disableFontFace = true;
pdfjsLib.GlobalWorkerOptions.useSystemFonts = false;

// Suppress polyfill warnings by mocking missing globals
if (typeof global.DOMMatrix === 'undefined') global.DOMMatrix = class {};
if (typeof global.Path2D === 'undefined') global.Path2D = class {};

// --- 3. Parser ---
module.exports = async function parsePDF(buffer, fileName) {
  const data = new Uint8Array(buffer);

  const pdf = await pdfjsLib.getDocument({
    data,
    standardFontDataUrl: pdfjsLib.GlobalWorkerOptions.standardFontDataUrl,
    cMapUrl: pdfjsLib.GlobalWorkerOptions.cMapUrl,
    cMapPacked: true,
    disableFontFace: true,
    useSystemFonts: false,
  }).promise;

  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map(item => item.str).join(' ');
    const tables = extractTablesFromText(text);

    pages.push({
      pageNumber: i,
      text,
      tables,
      metadata: { extractionMethod: 'pdfjs', confidence: 0.99 },
    });
  }

  return {
    fileType: 'pdf',
    fileName,
    pages,
    metadata: { totalPages: pdf.numPages, hasImages: false },
  };
};