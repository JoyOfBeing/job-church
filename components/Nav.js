'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';

export default function Nav() {
  const { user, member, loading, signOut } = useAuth();

  return (
    <nav>
      <Link href="/" className="logo">JOB</Link>
      <div className="links">
        {loading ? null : user ? (
          <>
            <Link href="/trinity">My Trinity</Link>
            {member?.is_admin && <Link href="/admin">Admin</Link>}
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
