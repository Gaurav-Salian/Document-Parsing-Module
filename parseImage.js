// parseImage.js
const { createWorker } = require('tesseract.js');
const { extractTablesFromText } = require('./utils/tableExtractor');

let worker;

async function getWorker() {
  if (!worker) {
    worker = await createWorker('eng');
  }
  return worker;
}

module.exports = async function parseImage(buffer, fileName) {
  const worker = await getWorker();
  const { data: { text, confidence } } = await worker.recognize(buffer);

  const tables = extractTablesFromText(text);

  return {
    fileType: 'image',
    fileName,
    pages: [{
      pageNumber: 1,
      text,
      tables,
      metadata: {
        extractionMethod: 'tesseract.js',
        confidence: confidence / 100
      }
    }],
    metadata: {
      totalPages: 1,
      hasImages: true,
      extractedAt: new Date().toISOString()
    }
  };
};