const fs = require('fs');

const cleanText = fs.readFileSync('water_ocr_output.txt', 'utf8').replace(/\|/g, '').trim();

console.log('--- OCR SNIPPET ---');
console.log(cleanText.substring(cleanText.indexOf('Consumption'), cleanText.indexOf('Amount') + 50));

const r1 = cleanText.match(/(?:current\s*month|month\s*\))[^\d]*(\d+)/i);
console.log('R1 (Current Month):', r1 ? r1[1] : 'null');

const r2 = cleanText.match(/(?:cons|usage|kwh).*?([\d,]+\.?\d*)/i);
console.log('R2 (Cons/Usage):', r2 ? r2[1] : 'null');

const r3 = cleanText.match(/(\d+)\s*(?:m3|cubic|meter)/i);
console.log('R3 (m3):', r3 ? r3[1] : 'null');

// Find all numbers on lines containing "Month"
const lines = cleanText.split('\n');
lines.forEach(line => {
  if (line.toLowerCase().includes('month')) {
    console.log('Line with Month:', line);
    console.log('Numbers on this line:', line.match(/\d+/g));
  }
});
