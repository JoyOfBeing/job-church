'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';

export default function Nav() {
  const { user, member, loading, signOut, supabase } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user || !supabase) return;

    async function checkUnread() {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .is('read_at', null);

      setUnread(count || 0);
    }

    checkUnread();
    const interval = setInterval(checkUnread, 30000);
    return () => clearInterval(interval);
  }, [user, supabase]);

  return (
    <nav>
      <Link href="/" className="logo">
        Joy of Being
      </Link>
      <div className="links">
        {loading ? null : user ? (
          <>
            <a href="/bulletin">Bulletin</a>
            <a href="/messages" className="nav-messages">
              Messages
              {unread > 0 && <span className="nav-badge">{unread}</span>}
            </a>
            <a href={`/member/${user.id}`}>My Profile</a>
            <span className="nav-coming-soon">Donate</span>
            {member?.is_admin && <a href="/admin">Admin</a>}
            <button className="nav-btn" onClick={signOut}>Sign out</button>
          </>
        ) : (
          <>
            <Link href="/doctrine">Doctrine</Link>
            <Link href="/login">Sign in</Link>
          </>
        )}
      </div>
    </nav>
  );
}
