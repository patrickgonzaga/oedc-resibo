'use client';

import { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { useStore } from '@/store/useStore';
import { UtilityType, ExtractedData } from '@/types';
import { parseReceiptText } from '@/services/parserService';
import { Loader2, Sparkles } from 'lucide-react';
import VerifyModal from './VerifyModal';

interface OCRScannerProps {
  utilityType: UtilityType;
}

export default function OCRScanner({ utilityType }: OCRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [showVerify, setShowVerify] = useState(false);
  const { addReceipt, user } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setProgress(0);

    try {
      const worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });

      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      const extracted = parseReceiptText(text);
      setExtractedData({ ...extracted, utilityType });
      setShowVerify(true);
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Failed to process receipt. Please try again.');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirm = async (data: ExtractedData) => {
    if (!user) return;
    try {
      await addReceipt({
        total_amount: data.total,
        consumption_kwh: data.consumption,
        billing_date: data.date,
        utility_type: data.utilityType || utilityType,
        user_id: user.id,
        image_url: null
      });
      setShowVerify(false);
      setExtractedData(null);
    } catch (error) {
      alert('Error saving receipt');
    }
  };

  return (
    <div className="w-full">
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
        className={`w-full py-4 rounded-2xl flex items-center justify-center transition-all transform active:scale-95 ${isScanning ? 'bg-white/10' : 'bg-white text-blue-600 shadow-xl shadow-blue-900/40 hover:bg-blue-50'}`}
      >
        {isScanning ? (
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 animate-spin text-white" />
            <span className="text-white font-bold">{progress}% Scanning...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold text-lg">Scan Now</span>
          </div>
        )}
      </button>

      <VerifyModal 
        isOpen={showVerify}
        onClose={() => setShowVerify(false)}
        data={extractedData}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
