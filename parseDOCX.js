// parseDOCX.js
const mammoth = require('mammoth');
const { extractTablesFromText } = require('./utils/tableExtractor');

module.exports = async function parseDOCX(buffer, fileName) {
  const { value: html } = await mammoth.convertToHtml({ buffer });
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const tables = extractTablesFromText(text);

  return {
    fileType: 'docx',
    fileName,
    pages: [{
      pageNumber: 1,
      text,
      tables,
      metadata: { extractionMethod: 'mammoth', confidence: 0.95 }
    }],
    metadata: { totalPages: 1, hasImages: false }
  };
};