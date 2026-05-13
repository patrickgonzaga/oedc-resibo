'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  Droplets, 
  History, 
  TrendingUp, 
  LogOut, 
  ChevronRight,
  Calendar,
  Wallet,
  Settings,
  Bell,
  User,
  Shield,
  Trash2,
  Edit2,
  X,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { UtilityType, Receipt, ExtractedData } from '@/types';
import OCRScanner from '@/components/OCRScanner';
import UsageChart from '@/components/UsageChart';
import ThemeToggle from '@/components/ThemeToggle';
import VerifyModal from '@/components/VerifyModal';

enum ViewMode {
  OVERVIEW = 'overview',
  HISTORY = 'history',
  SETTINGS = 'settings'
}

export default function DashboardPage() {
  const { user, receipts, isLoading, fetchReceipts, setUser, deleteReceipt, updateReceipt } = useStore();
  const [activeTab, setActiveTab] = useState<UtilityType>(UtilityType.ELECTRIC);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.OVERVIEW);
  const [showNotifications, setShowNotifications] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<UtilityType | 'all'>('all');
  
  // Settings State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
      }
    };
    checkUser();
  }, [router, setUser]);

  useEffect(() => {
    if (user) {
      fetchReceipts();
    }
  }, [user, fetchReceipts]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setUpdateError('Passwords do not match');
      return;
    }
    setUpdateLoading(true);
    setUpdateError('');
    setUpdateSuccess(false);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      setUpdateSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setUpdateError(error.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const filteredReceipts = receipts.filter(r => r.utility_type === activeTab);
  const historyReceipts = historyFilter === 'all' ? receipts : receipts.filter(r => r.utility_type === historyFilter);
  
  const currentMonthData = filteredReceipts[0] || null;

  const chartData = [...filteredReceipts].reverse().map(r => ({
    month: new Date(r.billing_date).toLocaleDateString('en-US', { month: 'short' }),
    amount: r.total_amount,
    consumption: r.consumption_kwh,
  }));

  const handleEditConfirm = async (data: ExtractedData) => {
    if (!editingReceipt) return;
    try {
      await updateReceipt(editingReceipt.id, {
        total_amount: data.total,
        consumption_kwh: data.consumption,
        billing_date: data.date,
        utility_type: data.utilityType
      });
      setShowEditModal(false);
      setEditingReceipt(null);
    } catch (error) {
      alert('Error updating receipt');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-blue-500/30 transition-colors duration-300">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Sidebar (Desktop) */}
      <nav className="fixed left-0 top-0 bottom-0 w-24 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col items-center py-8 z-50 transition-colors">
        <div className="mb-12">
          <img src="/resibo-icon.png" alt="Logo" className="w-12 h-12 object-contain" />
        </div>
        
        <div className="flex-1 space-y-8">
          <button 
            onClick={() => setViewMode(ViewMode.OVERVIEW)}
            className={`p-3 rounded-2xl transition-all ${viewMode === ViewMode.OVERVIEW ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <TrendingUp size={24} />
          </button>
          <button 
            onClick={() => setViewMode(ViewMode.HISTORY)}
            className={`p-3 rounded-2xl transition-all ${viewMode === ViewMode.HISTORY ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <History size={24} />
          </button>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-3 rounded-2xl transition-all relative ${showNotifications ? 'bg-slate-200 dark:bg-slate-800 text-blue-600' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Bell size={24} />
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-50 dark:border-slate-900" />
          </button>
          <button 
            onClick={() => setViewMode(ViewMode.SETTINGS)}
            className={`p-3 rounded-2xl transition-all ${viewMode === ViewMode.SETTINGS ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Settings size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <ThemeToggle />
          <button 
            onClick={handleLogout}
            className="p-3 text-slate-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={24} />
          </button>
        </div>
      </nav>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex md:hidden items-center justify-around py-4 z-50 transition-colors pb-safe">
        <button 
          onClick={() => setViewMode(ViewMode.OVERVIEW)}
          className={`p-2 rounded-xl transition-all ${viewMode === ViewMode.OVERVIEW ? 'text-blue-600' : 'text-slate-500'}`}
        >
          <TrendingUp size={24} />
        </button>
        <button 
          onClick={() => setViewMode(ViewMode.HISTORY)}
          className={`p-2 rounded-xl transition-all ${viewMode === ViewMode.HISTORY ? 'text-blue-600' : 'text-slate-500'}`}
        >
          <History size={24} />
        </button>
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className={`p-2 rounded-xl transition-all relative ${showNotifications ? 'text-blue-600' : 'text-slate-500'}`}
        >
          <Bell size={24} />
          <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
        </button>
        <button 
          onClick={() => setViewMode(ViewMode.SETTINGS)}
          className={`p-2 rounded-xl transition-all ${viewMode === ViewMode.SETTINGS ? 'text-blue-600' : 'text-slate-500'}`}
        >
          <Settings size={24} />
        </button>
        <ThemeToggle />
      </nav>

      {/* Main Content */}
      <main className="md:pl-32 px-4 md:pr-8 py-8 pb-32 md:pb-8 max-w-7xl mx-auto relative z-10">
        
        {/* Notifications Panel */}
        {showNotifications && (
          <div className="absolute top-2 md:left-32 left-4 right-4 md:right-auto md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl z-[60] overflow-hidden animate-in slide-in-from-left-4 duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold">Notifications</h3>
              <button onClick={() => setShowNotifications(false)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                <p className="text-sm font-bold text-blue-600">New Receipt Analyzed</p>
                <p className="text-xs text-slate-500 mt-1">Electricity bill for May 2026 has been added.</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <p className="text-sm font-bold">System Update</p>
                <p className="text-xs text-slate-500 mt-1">New OCR engine is now active for better accuracy.</p>
              </div>
            </div>
          </div>
        )}

        {viewMode === ViewMode.OVERVIEW && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
              <div className="flex items-center space-x-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600/10 p-2 rounded-[1.2rem] md:rounded-[1.5rem] border border-blue-500/20 flex items-center justify-center">
                  <img src="/resibo-icon.png" alt="Icon" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-1 md:mb-2">Overview</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm md:font-medium tracking-wide">Tracking {activeTab === UtilityType.ELECTRIC ? 'Electricity' : 'Water'} Consumption</p>
                </div>
              </div>

              <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full md:w-auto">
                <button
                  onClick={() => setActiveTab(UtilityType.ELECTRIC)}
                  className={`flex-1 md:flex-none flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === UtilityType.ELECTRIC ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <Zap className={`w-4 h-4 mr-2 ${activeTab === UtilityType.ELECTRIC ? 'fill-white' : ''}`} />
                  Electric
                </button>
                <button
                  onClick={() => setActiveTab(UtilityType.WATER)}
                  className={`flex-1 md:flex-none flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === UtilityType.WATER ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <Droplets className={`w-4 h-4 mr-2 ${activeTab === UtilityType.WATER ? 'fill-white' : ''}`} />
                  Water
                </button>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6 md:gap-8">
              <div className="col-span-12 md:col-span-8 space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-sm backdrop-blur-xl">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 md:mb-6">
                      <Wallet className="text-blue-500 w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest mb-1">Current Bill</p>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl md:text-3xl font-black">₱{currentMonthData?.total_amount.toLocaleString() || '0'}</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-sm backdrop-blur-xl">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-4 md:mb-6">
                      <Zap className="text-teal-500 w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest mb-1">Consumption</p>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl md:text-3xl font-black">{currentMonthData?.consumption_kwh.toLocaleString() || '0'}</span>
                      <span className="text-slate-500 text-xs md:text-sm font-bold">{activeTab === UtilityType.ELECTRIC ? 'kWh' : 'm³'}</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-sm backdrop-blur-xl sm:col-span-2 lg:col-span-1">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4 md:mb-6">
                      <Calendar className="text-amber-500 w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest mb-1">Last Billing</p>
                    <span className="text-lg md:text-xl font-black block mt-1 md:mt-2">
                      {currentMonthData ? new Date(currentMonthData.billing_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '---'}
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm backdrop-blur-xl min-h-[350px] md:min-h-[450px]">
                  <div className="flex justify-between items-center mb-6 md:mb-8">
                    <h2 className="text-lg md:text-xl font-black">Usage Trends</h2>
                  </div>
                  <div className="h-[250px] md:h-[350px] w-full">
                    <UsageChart data={chartData} />
                  </div>
                </div>
              </div>

              <div className="col-span-12 md:col-span-4 space-y-6 md:space-y-8">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-blue-900/40 relative overflow-hidden">
                  <div className="absolute -right-8 -top-8 bg-white/10 w-24 h-24 md:w-32 md:h-32 rounded-full" />
                  <div className="relative z-10">
                    <h2 className="text-xl md:text-2xl font-black text-white mb-2">Scan Receipt</h2>
                    <p className="text-blue-100 text-xs md:text-sm mb-6 opacity-80">Automatically extract data from your utility bills using AI OCR.</p>
                    <OCRScanner utilityType={activeTab} />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm">
                  <div className="flex justify-between items-center mb-6 md:mb-8">
                    <h2 className="text-lg md:text-xl font-black">Recent Activity</h2>
                    <button onClick={() => setViewMode(ViewMode.HISTORY)} className="text-blue-600 dark:text-blue-400 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:underline">View All</button>
                  </div>
                  <div className="space-y-4">
                    {filteredReceipts.slice(0, 3).map((receipt) => (
                      <div key={receipt.id} className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === UtilityType.ELECTRIC ? 'bg-blue-500/10 text-blue-500' : 'bg-teal-500/10 text-teal-500'}`}>
                            {activeTab === UtilityType.ELECTRIC ? <Zap size={18} /> : <Droplets size={18} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{new Date(receipt.billing_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                            <p className="text-xs text-slate-500 mt-1">₱{receipt.total_amount.toLocaleString()}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 dark:text-slate-700" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {viewMode === ViewMode.HISTORY && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-1 md:mb-2">History</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm md:font-medium">All your tracked receipts</p>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <button onClick={() => setHistoryFilter('all')} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${historyFilter === 'all' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-500'}`}>ALL</button>
                  <button onClick={() => setHistoryFilter(UtilityType.ELECTRIC)} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${historyFilter === UtilityType.ELECTRIC ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500'}`}>ELECTRIC</button>
                  <button onClick={() => setHistoryFilter(UtilityType.WATER)} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${historyFilter === UtilityType.WATER ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20' : 'text-slate-500'}`}>WATER</button>
                </div>
                <button 
                  onClick={() => setViewMode(ViewMode.OVERVIEW)}
                  className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-center"
                >
                  Back
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] md:rounded-[3rem] overflow-hidden backdrop-blur-xl shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px] md:min-w-0">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 md:px-8 py-4 md:py-6 text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">Date</th>
                      <th className="px-6 md:px-8 py-4 md:py-6 text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">Type</th>
                      <th className="px-6 md:px-8 py-4 md:py-6 text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">Usage</th>
                      <th className="px-6 md:px-8 py-4 md:py-6 text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">Amount</th>
                      <th className="px-6 md:px-8 py-4 md:py-6 text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyReceipts.map((receipt) => (
                      <tr key={receipt.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-6 md:px-8 py-4 md:py-6 font-bold text-sm md:text-base">{new Date(receipt.billing_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                        <td className="px-6 md:px-8 py-4 md:py-6">
                          <span className={`px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-tighter ${receipt.utility_type === UtilityType.ELECTRIC ? 'bg-blue-500/10 text-blue-600' : 'bg-teal-500/10 text-teal-600'}`}>
                            {receipt.utility_type}
                          </span>
                        </td>
                        <td className="px-6 md:px-8 py-4 md:py-6 text-xs md:text-sm font-medium text-slate-500 dark:text-slate-300">
                          {receipt.consumption_kwh} {receipt.utility_type === UtilityType.ELECTRIC ? 'kWh' : 'm³'}
                        </td>
                        <td className="px-6 md:px-8 py-4 md:py-6 font-black text-sm md:text-base">₱{receipt.total_amount.toLocaleString()}</td>
                        <td className="px-6 md:px-8 py-4 md:py-6 text-right">
                          <div className="flex justify-end space-x-1 md:space-x-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setEditingReceipt(receipt);
                                setShowEditModal(true);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => deleteReceipt(receipt.id)}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {viewMode === ViewMode.SETTINGS && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-1 md:mb-2">Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:font-medium mb-6 md:mb-10">Manage your profile and preferences</p>

            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] backdrop-blur-xl shadow-sm">
                <div className="flex items-center space-x-4 md:space-x-6 mb-8 md:mb-10">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl md:rounded-3xl flex items-center justify-center shrink-0">
                    <User size={32} className="md:w-10 md:h-10 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg md:text-xl font-bold truncate">{user?.email?.split('@')[0]}</h3>
                    <p className="text-slate-500 text-sm truncate">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center space-x-3 mb-6">
                      <Shield size={20} className="text-blue-500" />
                      <h4 className="text-base md:text-lg font-black tracking-tight">Security & Password</h4>
                    </div>
                    
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-4 text-slate-500" size={18} />
                          <input 
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-11 pr-4 py-3.5 md:py-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-4 text-slate-500" size={18} />
                          <input 
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-11 pr-4 py-3.5 md:py-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {updateError && <p className="text-red-500 text-[10px] font-bold ml-1">{updateError}</p>}
                      {updateSuccess && (
                        <div className="flex items-center space-x-2 text-green-500 bg-green-500/10 p-3 md:p-4 rounded-2xl">
                          <CheckCircle2 size={16} />
                          <p className="text-[10px] md:text-xs font-bold">Password updated successfully!</p>
                        </div>
                      )}

                      <button 
                        type="submit"
                        disabled={updateLoading}
                        className="w-full py-3.5 md:py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm md:text-base hover:bg-slate-800 dark:hover:bg-slate-100 transition-all disabled:opacity-50"
                      >
                        {updateLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full py-4 md:py-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-bold text-sm md:text-base hover:bg-red-500/20 transition-all flex items-center justify-center"
              >
                <LogOut size={18} className="mr-2" />
                Sign Out from All Devices
              </button>
            </div>
          </div>
        )}

        <VerifyModal 
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingReceipt(null);
          }}
          data={editingReceipt ? {
            total: editingReceipt.total_amount,
            consumption: editingReceipt.consumption_kwh,
            date: editingReceipt.billing_date,
            utilityType: editingReceipt.utility_type
          } : null}
          onConfirm={handleEditConfirm}
        />
      </main>
    </div>
  );
}
