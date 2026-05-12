import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useStore } from '../store/useStore';
import { Sun, Moon } from 'lucide-react-native';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useStore();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      className={`p-3 rounded-2xl shadow-lg ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}
    >
      {isDarkMode ? (
        <Sun size={24} color="#94a3b8" />
      ) : (
        <Moon size={24} color="#64748b" />
      )}
    </TouchableOpacity>
  );
}
