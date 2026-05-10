import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { UserProfile, Receipt } from '../types';

interface AppState {
  user: UserProfile | null;
  receipts: Receipt[];
  isLoading: boolean;
  
  setUser: (user: UserProfile | null) => void;
  fetchReceipts: () => Promise<void>;
  addReceipt: (receipt: Omit<Receipt, 'id' | 'created_at'>) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;
  updateReceipt: (id: string, receipt: Partial<Omit<Receipt, 'id' | 'created_at'>>) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  receipts: [],
  isLoading: false,

  setUser: (user) => set({ user }),

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

  updateReceipt: async (id, receipt) => {
    try {
      const { error } = await supabase
        .from('receipts')
        .update(receipt)
        .eq('id', id);
        
      if (error) throw error;
      await get().fetchReceipts();
    } catch (error) {
      console.error('Update receipt error:', error);
      throw error;
    }
  },
}));
