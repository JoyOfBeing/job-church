'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { supabase, user, loading: authLoading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="auth-page">
        <h1>Reset password</h1>
        <p className="subtitle">Verifying your reset link...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-page">
        <h1>Reset password</h1>
        <p className="subtitle">This reset link is invalid or expired. Please request a new one.</p>
        <a href="/forgot-password" className="btn btn-gold btn-full" style={{ marginTop: '1rem' }}>
          Request new link
        </a>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push('/braid'), 2000);
  }

  return (
    <div className="auth-page">
      <h1>Set new password</h1>
      <p className="subtitle">Choose a new password for your account.</p>

      {error && <div className="error-msg">{error}</div>}

      {success ? (
        <div className="success-msg">
          Password updated. Redirecting...
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="field">
            <label>Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-gold btn-full" disabled={loading}>
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>
      )}
    </div>
  );
}
