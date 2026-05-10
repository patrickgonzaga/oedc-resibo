const fs = require('fs');
const text = fs.readFileSync('ocr_output.txt', 'utf8');

const totalRegex = /(?:total amount due)[\s:]*([\d,]+\.\d{2})/i;
const consumptionRegexRow = /1\.00\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})/;
const dateRegex = /(\d{2}\/\d{2}\/\d{4})/; // Look for 03/03/2026 To 04/01/2026

console.log('Total Match:', text.match(totalRegex));
console.log('Row Match:', text.match(consumptionRegexRow));
console.log('Date Match:', text.match(dateRegex));
