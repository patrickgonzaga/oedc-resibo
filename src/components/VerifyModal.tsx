'use client';

import { useState, useEffect } from 'react';
import { UtilityType, ExtractedData } from '@/types';
import { X, Check, Calendar, Zap, Droplets, Banknote, Hash } from 'lucide-react';

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ExtractedData | null;
  onConfirm: (data: ExtractedData) => void;
}

export default function VerifyModal({ isOpen, onClose, data, onConfirm }: VerifyModalProps) {
  const [editedData, setEditedData] = useState<ExtractedData | null>(null);

  useEffect(() => {
    if (data) setEditedData(data);
  }, [data]);

  if (!isOpen || !editedData) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-white">Verify Details</h2>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Utility Toggle */}
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setEditedData({...editedData, utilityType: UtilityType.ELECTRIC})}
                className={`flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all ${editedData.utilityType === UtilityType.ELECTRIC ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Zap size={16} className="mr-2" />
                Electric
              </button>
              <button
                onClick={() => setEditedData({...editedData, utilityType: UtilityType.WATER})}
                className={`flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all ${editedData.utilityType === UtilityType.WATER ? 'bg-teal-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Droplets size={16} className="mr-2" />
                Water
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                  <Calendar size={12} className="mr-2" /> Billing Date
                </label>
                <input
                  type="date"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  value={editedData.date}
                  onChange={(e) => setEditedData({...editedData, date: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                    <Hash size={12} className="mr-2" /> Usage ({editedData.utilityType === UtilityType.ELECTRIC ? 'kWh' : 'm³'})
                  </label>
                  <input
                    type="number"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-bold"
                    value={editedData.consumption}
                    onChange={(e) => setEditedData({...editedData, consumption: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                    <Banknote size={12} className="mr-2" /> Total (₱)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-bold"
                    value={editedData.total}
                    onChange={(e) => setEditedData({...editedData, total: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-slate-950 border border-slate-800 text-slate-400 rounded-2xl font-bold hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(editedData)}
              className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center"
            >
              <Check size={20} className="mr-2" />
              Confirm & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
