import { ExtractedData, UtilityType } from '../types';

export const parseReceiptText = (text: string): ExtractedData => {
  const cleanText = text.replace(/\|/g, '').trim();
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  let total = 0;
  let consumption = 0;
  let date = '';
  let utilityType: UtilityType = UtilityType.ELECTRIC;

  if (/water|subic/i.test(cleanText)) {
    utilityType = UtilityType.WATER;
  }

  // 1. Billing Month & Year
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const billingMonthLine = lines.find(l => 
    (/hou|bill|period|month/i.test(l)) && 
    months.some(m => new RegExp(m.substring(0, 3), 'i').test(l))
  );

  if (billingMonthLine) {
    for (let i = 0; i < months.length; i++) {
      const mMatch = new RegExp(months[i].substring(0, 3), 'i').test(billingMonthLine);
      if (mMatch) {
        const yearMatch = billingMonthLine.match(/202[0-9]/);
        const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
        const month = String(i + 1).padStart(2, '0');
        date = `${year}-${month}-01`;
        break;
      }
    }
  }

  // 2. Consumption
  if (utilityType === UtilityType.WATER) {
    const waterConsMatch = cleanText.match(/(?:consumption|current\s*month)[^\d]*(\d+)/i);
    if (waterConsMatch) consumption = parseInt(waterConsMatch[1]);
  } else {
    // Electric: Robust calculation (Present - Previous)
    const oedcRowMatch = cleanText.match(/(?:1[.,]00|100|1\.0)\s+([\d,.]+)\s+([\d,.]+)\s+([\d,.]+)/);
    if (oedcRowMatch) {
      const val1 = parseFloat(oedcRowMatch[1].replace(/,/g, ''));
      const val2 = parseFloat(oedcRowMatch[2].replace(/,/g, ''));
      const val3 = parseFloat(oedcRowMatch[3].replace(/,/g, ''));
      
      if (Math.abs(val2 - val1) > 0 && Math.abs(val2 - val1) < 2000) {
        consumption = Math.abs(val2 - val1);
      } else if (Math.abs(val3 - val2) > 0 && Math.abs(val3 - val2) < 2000) {
        consumption = Math.abs(val3 - val2);
      } else {
        consumption = val3;
      }
    }

    if (consumption === 0) {
      const consLabelIndex = lines.findIndex(l => /kwh\s*cons/i.test(l));
      if (consLabelIndex !== -1 && lines[consLabelIndex + 1]) {
        const nextLine = lines[consLabelIndex + 1];
        const allNums = nextLine.match(/[\d,]+\.\d{2}|[\d,]+\.\d{1}|\d{2,}/g);
        if (allNums && allNums.length > 0) {
          consumption = parseFloat(allNums[allNums.length - 1].replace(/,/g, ''));
        }
      }
    }
  }

  // 3. Total Amount Due
  const totalMatch = cleanText.match(/(?:total\s*amount\s*due|amount\s*due|total\s*current\s*bill)[^\d]*([\d,]+\.\d{2})/i);
  if (totalMatch) {
    total = parseFloat(totalMatch[1].replace(/,/g, ''));
  }

  if (!date) {
    const d = new Date();
    date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }

  return { total, consumption, date, utilityType };
};
