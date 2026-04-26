import Tesseract from 'tesseract.js';
import fs from 'fs';
import pdf from 'pdf-parse';

export async function extractTextFromFile(filePath, mimeType) {
  if (mimeType === 'application/pdf') {
    return extractTextFromPDF(filePath);
  } else if (mimeType.startsWith('image/')) {
    return extractTextFromImage(filePath);
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
}

async function extractTextFromImage(filePath) {
  try {
    const result = await Tesseract.recognize(filePath, 'eng', {
      logger: () => {},
    });
    return result.data.text;
  } catch (error) {
    throw new Error(`OCR extraction failed: ${error.message}`);
  }
}

export default { extractTextFromFile };