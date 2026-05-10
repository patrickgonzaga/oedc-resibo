const { createWorker } = require('tesseract.js');

async function testOCR() {
  const worker = await createWorker('eng');
  const imagePath = 'IMG20260510192256.jpg';
  const { data: { text } } = await worker.recognize(imagePath);
  console.log('--- EXTRACTED TEXT ---');
  console.log(text);
  console.log('----------------------');
  await worker.terminate();
}

testOCR();
