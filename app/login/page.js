'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../components/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { supabase } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push('/journey');
  }

  return (
    <div className="auth-page">
      <h1>Welcome back</h1>
      <p className="subtitle">Sign in to continue your journey.</p>

      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-gold btn-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="auth-switch">
        Not a member yet? <Link href="/doctrine">Read the doctrine</Link>
      </p>
    </div>
  );
}
