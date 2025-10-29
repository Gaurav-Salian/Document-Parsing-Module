// parseTXT.js
const { extractTablesFromText } = require('./utils/tableExtractor');

module.exports = function parseTXT(buffer, fileName) {
  const text = buffer.toString('utf-8').trim();

  const tables = extractTablesFromText(text);

  return {
    fileType: 'txt',
    fileName,
    pages: [
      {
        pageNumber: 1,
        text,
        tables,
        metadata: {
          extractionMethod: 'utf8',
          confidence: 1.0,
        },
      },
    ],
    metadata: {
      totalPages: 1,
      hasImages: false,
    },
  };
};