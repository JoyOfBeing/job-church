'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '../../lib/supabase';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/update-password`
      : '/update-password';

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <h1>Reset password</h1>
      <p className="subtitle">We'll send you a link to reset it.</p>

      {error && <div className="error-msg">{error}</div>}

      {sent ? (
        <div className="success-msg">
          Check your email for a reset link.
        </div>
      ) : (
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

          <button type="submit" className="btn btn-gold btn-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      )}

      <p className="auth-switch">
        <Link href="/login">Back to sign in</Link>
      </p>
    </div>
  );
}
