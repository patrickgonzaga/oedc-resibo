// OCR Service for Mobile
// In a real mobile app, we might use a native library or cloud OCR (e.g. Google Vision)
// to keep the bundle size small. For this MVP, we'll provide the interface.

export const performOCR = async (imageUri: string): Promise<string> => {
  // Placeholder for OCR logic
  // On mobile, you would typically send the image to a Supabase Edge Function
  // or use a local Tesseract wrapper.
  
  console.log('Performing OCR on:', imageUri);
  
  // Simulation: Return mock text that matches the OEDC format for testing
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`
        LLG Hou: APRIL 2026
        METER NUMBER MULT PREVIOUS PRESENT KWH CONS
        39SE042860 1.00 49,250.00 49,557.00 307.00
        TOTAL AMOUNT DUE 2,590.16
      `);
    }, 2000);
  });
};
