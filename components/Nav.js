'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from './AuthProvider';

export default function Nav() {
  const { user, member, loading, signOut } = useAuth();

  return (
    <nav>
      <Link href="/" className="logo">
        <Image
          src="/job-logo.png"
          alt="J.O.B."
          width={1280}
          height={720}
          style={{ width: '80px', height: 'auto' }}
        />
      </Link>
      <div className="links">
        {loading ? null : user ? (
          <>
            <a href="/braid">My Braid</a>
            <a href="/snl">SNL</a>
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
