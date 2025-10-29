// parseXLSX.js
const XLSX = require('xlsx');
const { extractTablesFromText } = require('./utils/tableExtractor');

module.exports = function parseXLSX(buffer, fileName) {
  // --- 1. Read workbook ---
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  const pages = [];

  workbook.SheetNames.forEach((sheetName, idx) => {
    const worksheet = workbook.Sheets[sheetName];

    // --- 2. Convert to 2D array (preserves empty cells) ---
    const json = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',   // empty cells → ''
      blankrows: true,
    });

    // --- 3. Plain-text version for table detection ---
    const text = json.map(row => row.join('\t')).join('\n');

    // --- 4. Use the same table extractor as PDF/DOCX ---
    const tables = extractTablesFromText(text);

    // --- 5. If no heuristic tables found, return the raw grid as a table ---
    const finalTables = tables.length > 0
      ? tables
      : [{ rows: json, confidence: 1.0 }];

    pages.push({
      pageNumber: idx + 1,
      text,
      tables: finalTables,
      metadata: {
        extractionMethod: 'xlsx',
        confidence: 1.0,
      },
    });
  });

  return {
    fileType: 'xlsx',
    fileName,
    pages,
    metadata: {
      totalPages: workbook.SheetNames.length,
      hasImages: false,
    },
  };
};