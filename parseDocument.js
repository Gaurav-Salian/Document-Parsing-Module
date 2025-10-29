// parseDocument.js
const fs = require('fs');
const path = require('path');

const parsePDF   = require('./parsePDF');
const parseImage = require('./parseImage');
const parseDOCX  = require('./parseDOCX');
const parseXLSX  = require('./parseXLSX');
const parseTXT   = require('./parseTXT');   // ← NEW

const EXT_MAP = {
  '.pdf' : parsePDF,
  '.jpg' : parseImage, '.jpeg': parseImage, '.png': parseImage,
  '.docx': parseDOCX,
  '.xlsx': parseXLSX, '.xls': parseXLSX,
  '.txt' : parseTXT,                                   // ← NEW
};

async function parseDocument(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const parser = EXT_MAP[ext];

  if (!parser || typeof parser !== 'function') {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  const fileName = path.basename(filePath);
  const buffer = fs.readFileSync(filePath);

  return await parser(buffer, fileName);
}

module.exports = parseDocument;