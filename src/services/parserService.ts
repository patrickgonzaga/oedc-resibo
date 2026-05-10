import { ExtractedData } from '../types';

export const parseReceiptText = (text: string): ExtractedData => {
  // Normalize text to remove strange characters
  const cleanText = text.replace(/\|/g, '').trim();

  // Target specific phrases as requested
  const totalRegex = /total\s*amount\s*due[^\d]*([\d,]+\.\d{2})/i;
  // Use [ \t:]* instead of [^\d]* so it doesn't jump to the next line and grab meter numbers like 39SE...
  const consumptionRegex = /kwh\s*cons[ \t:=]*([\d,]+\.?\d*)/i;
  const billingMonthRegex = /billing\s*month[^\w]*(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i;

  const totalMatch = cleanText.match(totalRegex);
  const consumptionMatch = cleanText.match(consumptionRegex);
  const billingMonthMatch = cleanText.match(billingMonthRegex);

  // Helper to format Date without Timezone shifting to previous day
  const toLocalISOString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Parse Total
  let total = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, '')) : 0;
  if (total === 0) {
    const fTotal = cleanText.match(/(?:total|amount|due)[\s:]*([\d,]+\.\d{2})/i);
    if (fTotal) total = parseFloat(fTotal[1].replace(/,/g, ''));
  }

  // Parse Consumption
  let consumption = consumptionMatch ? parseFloat(consumptionMatch[1].replace(/,/g, '')) : 0;
  if (consumption === 0) {
    // Fallback: look for typical Olongapo row format (e.g. 1.00 49,250.00 49,557.00 307.00)
    // We make it more lenient by allowing any multiplier like 1.00, 1,00, 100 etc.
    const fOedc = cleanText.match(/(?:1[.,]00|100|1\.0)\s+[\d,]+\.\d{2}\s+[\d,]+\.\d{2}\s+([\d,]+\.\d{2})/i);
    // More flexible kWh matcher
    const fMeralco = cleanText.match(/(\d+\.?\d*)\s*(?:kWh|kilowatt|kw|kh|kuh)/i);
    // Also look for "CONS" or "USAGE" followed by a number
    const fUsage = cleanText.match(/(?:cons|usage|consumption)[^\d]*(\d+\.?\d*)/i);
    
    if (fOedc) {
      consumption = parseFloat(fOedc[1].replace(/,/g, ''));
    } else if (fMeralco) {
      consumption = parseFloat(fMeralco[1]);
    } else if (fUsage) {
      consumption = parseFloat(fUsage[1]);
    }
  }
  
  // Parse Date
  let date = toLocalISOString(new Date());
  if (billingMonthMatch) {
    const parsedDate = new Date(`${billingMonthMatch[1]} 1, ${billingMonthMatch[2]}`);
    if (!isNaN(parsedDate.getTime())) date = toLocalISOString(parsedDate);
  } else {
    const fMonth = cleanText.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i);
    if (fMonth) {
      const parsedDate = new Date(`${fMonth[1]} 1, ${fMonth[2]}`);
      if (!isNaN(parsedDate.getTime())) date = toLocalISOString(parsedDate);
    }
  }

  return {
    total,
    consumption,
    date,
  };
};
