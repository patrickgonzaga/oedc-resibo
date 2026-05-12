import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { UtilityType, Receipt } from '../types';

interface AppState {
  user: any | null;
  receipts: Receipt[];
  isLoading: boolean;
  isDarkMode: boolean;
  
  setUser: (user: any | null) => void;
  fetchReceipts: () => Promise<void>;
  addReceipt: (receipt: Omit<Receipt, 'id' | 'created_at'>) => Promise<void>;
  updateReceipt: (id: string, updates: Partial<Receipt>) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;
  toggleTheme: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  receipts: [],
  isLoading: false,
  isDarkMode: true,

  setUser: (user) => set({ user }),
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

  fetchReceipts: async () => {
    const { user } = get();
    if (!user) return;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('user_id', user.id)
        .order('billing_date', { ascending: false });
        
      if (error) throw error;
      set({ receipts: data as Receipt[], isLoading: false });
    } catch (error) {
      console.error('Fetch receipts error:', error);
      set({ isLoading: false });
    }
  },

  addReceipt: async (receipt) => {
    try {
      const { error } = await supabase
        .from('receipts')
        .insert([receipt]);
      
      if (error) throw error;
      await get().fetchReceipts();
    } catch (error) {
      console.error('Add receipt error:', error);
      throw error;
    }
  },

  deleteReceipt: async (id) => {
    try {
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      await get().fetchReceipts();
    } catch (error) {
      console.error('Delete receipt error:', error);
      throw error;
    }
  },
}));
