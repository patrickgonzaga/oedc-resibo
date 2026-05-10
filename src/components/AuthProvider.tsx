'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at,
        });
        if (pathname === '/login' || pathname === '/register') {
          router.push('/dashboard');
        }
      } else {
        setUser(null);
        if (pathname !== '/login' && pathname !== '/register') {
          router.push('/login');
        }
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at,
        });
        if (pathname === '/login' || pathname === '/register') {
          router.push('/dashboard');
        }
      } else {
        setUser(null);
        if (pathname !== '/login' && pathname !== '/register') {
          router.push('/login');
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pathname, router, setUser]);

  return <>{children}</>;
}
