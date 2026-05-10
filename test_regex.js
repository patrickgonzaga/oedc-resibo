const fs = require('fs');

const text = fs.readFileSync('ocr_output.txt', 'utf8');

const parseReceiptText = (text) => {
  const totalRegex = /(?:total|amount|due|pay)[^\d]*([\d,]+\.?\d{0,2})/i;
  // Look for sequence: MULTIPLIER (e.g. 1.00) PREV CURR CONS
  const consumptionRegexRow = /(?:1\.00|MULTIPLIER)\s+([\d,]+\.\d+)\s+([\d,]+\.\d+)\s+([\d,]+\.\d+)/;
  const consumptionRegexFallback = /(?:consumption)[^\d]*(\d+\.?\d*)|(\d+\.?\d*)\s*(?:kWh|kilowatt)/i;
  
  const dateRegex = /(\d{4}-\d{2}-\d{2})|(\w{3,9}\s\d{1,2},?\s\d{4})|(\d{2}\/\d{2}\/\d{4})/;

  const totalMatch = text.match(totalRegex);
  
  let consumption = 0;
  const rowMatch = text.match(consumptionRegexRow);
  if (rowMatch) {
     const prev = parseFloat(rowMatch[1].replace(/,/g, ''));
     const curr = parseFloat(rowMatch[2].replace(/,/g, ''));
     const diff = parseFloat(rowMatch[3].replace(/,/g, ''));
     if (Math.abs((curr - prev) - diff) < 1) {
        consumption = diff;
     } else {
        consumption = diff; // likely it's the last number anyway
     }
  } else {
     const fallbackMatch = text.match(consumptionRegexFallback);
     if (fallbackMatch) {
       consumption = parseFloat(fallbackMatch[1] || fallbackMatch[2]);
     }
  }
  
  const dateMatch = text.match(dateRegex);

  const total = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, '')) : 0;
  
  let date = new Date().toISOString().split('T')[0];
  if (dateMatch) {
    try {
      const parsedDate = new Date(dateMatch[0]);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate.toISOString().split('T')[0];
      }
    } catch(e) {}
  }

  return {
    total,
    consumption,
    date,
  };
};

console.log(parseReceiptText(text));
