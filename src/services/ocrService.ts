import { createWorker } from 'tesseract.js';

export const performOCR = async (imageFile: File): Promise<string> => {
  try {
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(imageFile);
    await worker.terminate();
    return text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
};
