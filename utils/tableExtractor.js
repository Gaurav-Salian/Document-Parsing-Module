// utils/tableExtractor.js
function extractTablesFromText(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const tables = [];
    let current = null;
  
    for (const line of lines) {
      const cols = line.split(/\s{2,}|\t/).map(c => c.trim()).filter(Boolean);
      if (cols.length > 1) {
        if (!current) current = { rows: [cols], confidence: 0.9 };
        else current.rows.push(cols);
      } else if (current && current.rows.length > 1) {
        tables.push(current);
        current = null;
      }
    }
    if (current && current.rows.length > 1) tables.push(current);
    return tables;
  }
  
  // ← named export
  module.exports = { extractTablesFromText };
