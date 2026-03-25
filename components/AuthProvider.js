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
    // Use getSession (local, fast) instead of getUser (network call that can hang)
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session?.user) {
        setUser(null);
        setMember(null);
        setLoading(false);
        return;
      }
      setUser(session.user);
      fetchMember(session.user.id).finally(() => setLoading(false));
    }).catch(() => {
      setUser(null);
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
