'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  async function fetchMember(userId) {
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setMember(data);
    }
  }

  useEffect(() => {
    // Hard timeout — never hang longer than 2s no matter what
    const hardTimeout = setTimeout(() => setLoading(false), 2000);

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session?.user) {
        setUser(null);
        setMember(null);
        clearTimeout(hardTimeout);
        setLoading(false);
        return;
      }
      setUser(session.user);
      fetchMember(session.user.id).finally(() => {
        clearTimeout(hardTimeout);
        setLoading(false);
      });
    }).catch(() => {
      setUser(null);
      clearTimeout(hardTimeout);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          await fetchMember(u.id);
        } else {
          setMember(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setMember(null);
    window.location.href = '/';
  }

  return (
    <AuthContext.Provider value={{ user, member, loading, supabase, signOut, fetchMember }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
