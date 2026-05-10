'use client';

import { useEffect, useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import { performOCR } from '@/services/ocrService';
import { parseReceiptText } from '@/services/parserService';
import { format, subMonths, isSameMonth } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LogOut, Upload, FileText, Zap, Droplets, Loader2, Trash2, Moon, Sun, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { UtilityType } from '@/types';

export default function DashboardPage() {
  const { user, receipts, fetchReceipts, addReceipt, deleteReceipt, updateReceipt } = useStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Verification Modal State
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [scannedData, setScannedData] = useState<{ total: number, consumption: number, date: string, utilityType: UtilityType } | null>(null);
  const [editingReceiptId, setEditingReceiptId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<UtilityType>(UtilityType.ELECTRIC);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (user) {
      fetchReceipts();
    }
  }, [user, fetchReceipts]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      // 1. Process OCR
      const text = await performOCR(file);
      const extracted = parseReceiptText(text);

      if (extracted.total === 0 && extracted.consumption === 0) {
        alert("Could not detect any values from the image. Please ensure it's a clear utility receipt.");
        setIsUploading(false);
        return;
      }

      setScannedData({
        ...extracted,
        utilityType: extracted.utilityType || UtilityType.ELECTRIC
      });
      setShowVerifyModal(true);

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to process receipt. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmSave = async () => {
    if (!scannedData || !user) return;
    try {
      if (editingReceiptId) {
        await updateReceipt(editingReceiptId, {
          total_amount: scannedData.total,
          consumption_kwh: scannedData.consumption,
          billing_date: scannedData.date,
          utility_type: scannedData.utilityType,
        });
      } else {
        await addReceipt({
          user_id: user.id,
          image_url: null,
          total_amount: scannedData.total,
          consumption_kwh: scannedData.consumption,
          billing_date: scannedData.date,
          utility_type: scannedData.utilityType,
        });
      }
      setShowVerifyModal(false);
      setScannedData(null);
      setEditingReceiptId(null);
    } catch (err) {
      alert("Failed to save receipt.");
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  }

  const filteredReceipts = receipts.filter(r => r.utility_type === activeTab);

  const latestReceiptDate = filteredReceipts.length > 0
    ? new Date(Math.max(...filteredReceipts.map(r => new Date(r.billing_date).getTime())))
    : new Date();

  const currentMonthReceipts = filteredReceipts.filter(r => isSameMonth(new Date(r.billing_date), latestReceiptDate));

  const totalBill = currentMonthReceipts.reduce((sum, r) => sum + r.total_amount, 0);
  const totalConsumption = currentMonthReceipts.reduce((sum, r) => sum + r.consumption_kwh, 0);

  // Chart data
  const chartData = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(latestReceiptDate, 5 - i);
    const monthReceipts = filteredReceipts.filter(r => isSameMonth(new Date(r.billing_date), d));
    return {
      name: format(d, 'MMM'),
      amount: monthReceipts.reduce((sum, r) => sum + r.total_amount, 0),
      consumption: monthReceipts.reduce((sum, r) => sum + r.consumption_kwh, 0),
    };
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">Resibo</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab(UtilityType.ELECTRIC)}
                className={`flex items-center px-4 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === UtilityType.ELECTRIC ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Zap className="w-4 h-4 mr-2" />
                Electric
              </button>
              <button
                onClick={() => setActiveTab(UtilityType.WATER)}
                className={`flex items-center px-4 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === UtilityType.WATER ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Droplets className="w-4 h-4 mr-2" />
                Water
              </button>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
            >
              <LogOut className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">

        {/* Welcome & Upload */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, {user.email?.split('@')[0]}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Here is your utility consumption overview.</p>
          </div>

          <div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition shadow-sm disabled:opacity-70"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Upload className="w-5 h-5 mr-2" />
              )}
              {isUploading ? 'Processing...' : 'Scan Receipt'}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-4 transition-colors">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Month Bill</p>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">₱{totalBill.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-4 transition-colors">
            <div className="p-4 bg-teal-50 dark:bg-teal-900/30 rounded-xl">
              {activeTab === UtilityType.ELECTRIC ? (
                <Zap className="w-8 h-8 text-teal-600 dark:text-teal-400" />
              ) : (
                <Droplets className="w-8 h-8 text-teal-600 dark:text-teal-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Consumption</p>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{totalConsumption} <span className="text-xl font-medium text-slate-500 dark:text-slate-400">{activeTab === UtilityType.ELECTRIC ? 'kWh' : 'm³'}</span></h2>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Usage Trends (Last 6 Months)</h3>
          <div className="h-[300px] w-full" style={{ minHeight: 300 }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `₱${value}`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `${value}${activeTab === UtilityType.ELECTRIC ? 'kWh' : 'm³'}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.2} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: theme === 'dark' ? '#1E293B' : '#FFF', color: theme === 'dark' ? '#FFF' : '#000' }}
                  formatter={(value: any, name: any) => [
                    name === 'amount' ? `₱${Number(value).toLocaleString()}` : `${value} ${activeTab === UtilityType.ELECTRIC ? 'kWh' : 'm³'}`,
                    name === 'amount' ? 'Amount' : 'Consumption'
                  ]}
                />
                <Area yAxisId="left" type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                <Area yAxisId="right" type="monotone" dataKey="consumption" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorCons)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent History */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent {activeTab === UtilityType.ELECTRIC ? 'Electric' : 'Water'} Receipts</h3>
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed transition-colors">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No receipts found</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Scan a receipt to start tracking.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                      <th className="py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-300">Date</th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-300">Amount</th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-300">Consumption</th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReceipts.map((receipt) => (
                      <tr key={receipt.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="py-4 px-6 text-sm font-medium text-slate-900 dark:text-white">
                          {format(new Date(receipt.billing_date), 'MMMM yyyy')}
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">
                          ₱{receipt.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">
                          {receipt.consumption_kwh} {receipt.utility_type === UtilityType.ELECTRIC ? 'kWh' : 'm³'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => {
                              setScannedData({
                                total: receipt.total_amount,
                                consumption: receipt.consumption_kwh,
                                date: receipt.billing_date,
                                utilityType: receipt.utility_type
                              });
                              setEditingReceiptId(receipt.id);
                              setShowVerifyModal(true);
                            }}
                            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition mr-3"
                            title="Edit receipt"
                          >
                            <Pencil className="w-5 h-5 inline-block" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this receipt?')) {
                                deleteReceipt(receipt.id);
                              }
                            }}
                            className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
                            title="Delete receipt"
                          >
                            <Trash2 className="w-5 h-5 inline-block" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Verification Modal */}
      {showVerifyModal && scannedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Verify Receipt Data</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Please check and correct the extracted values if the OCR misread them.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Billing Month (Date)</label>
                <input
                  type="date"
                  value={scannedData.date}
                  onChange={(e) => setScannedData({ ...scannedData, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Utility Type</label>
                <select
                  value={scannedData.utilityType}
                  onChange={(e) => setScannedData({ ...scannedData, utilityType: e.target.value as UtilityType })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  <option value={UtilityType.ELECTRIC}>Electric (OEDC)</option>
                  <option value={UtilityType.WATER}>Water (Subic Water)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Consumption ({scannedData.utilityType === UtilityType.ELECTRIC ? 'kWh' : 'm³'})</label>
                <input
                  type="number"
                  value={scannedData.consumption}
                  onChange={(e) => setScannedData({ ...scannedData, consumption: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Amount Due (₱)</label>
                <input
                  type="number"
                  value={scannedData.total}
                  onChange={(e) => setScannedData({ ...scannedData, total: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setScannedData(null);
                  setEditingReceiptId(null);
                }}
                className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition shadow-sm"
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
