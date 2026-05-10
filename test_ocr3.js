const { createWorker } = require('tesseract.js');
const fs = require('fs');

async function testOCR() {
  console.log('Starting OCR test for IMG_20260510_142850.jpg...');
  const worker = await createWorker('eng');
  const imagePath = 'IMG_20260510_142850.jpg';
  
  if (!fs.existsSync(imagePath)) {
    console.error('Image not found:', imagePath);
    process.exit(1);
  }

  const { data: { text } } = await worker.recognize(imagePath);
  console.log('--- EXTRACTED TEXT ---');
  console.log(text);
  console.log('----------------------');
  
  await worker.terminate();
}

testOCR();
