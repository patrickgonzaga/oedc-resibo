import { createWorker } from 'tesseract.js';
import fs from 'fs';

async function run() {
  const imagePath = 'd:/PatCommandCenter/projects/kiloview-web/IMG_20260510_125607.jpg';
  const worker = await createWorker('eng');
  const { data: { text } } = await worker.recognize(imagePath);
  console.log('--- EXTRACTED TEXT ---');
  console.log(text);
  await worker.terminate();
}

run().catch(console.error);
