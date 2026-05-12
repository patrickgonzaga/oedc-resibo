'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return (
    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl w-12 h-12 border border-slate-200 dark:border-slate-700" />
  );

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    console.log('Switching theme to:', nextTheme);
    setTheme(nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-all shadow-lg active:scale-95"
      aria-label="Toggle Theme"
    >
      {resolvedTheme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
    </button>
  );
}
