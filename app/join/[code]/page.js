'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '../../../lib/supabase';

export default function JoinPage() {
  const { code } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [status, setStatus] = useState('checking'); // checking, needsAuth, joining, full, error, success

  // OTP state
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        joinTrinity(session.user);
      } else {
        setStatus('needsAuth');
      }
    });
  }, []);

  async function joinTrinity(u) {
    setStatus('joining');

    // Use RPC to look up invite code (bypasses RLS safely)
    const { data: lookup, error: lookupError } = await supabase
      .rpc('lookup_invite_code', { code });

    if (lookupError || !lookup || lookup.length === 0) {
      setStatus('error');
      return;
    }

    const { trinity_id, member_count } = lookup[0];

    // Check if already a member
    const { data: existingMembership } = await supabase
      .from('trinity_members')
      .select('id')
      .eq('trinity_id', trinity_id)
      .eq('member_id', u.id)
      .single();

    if (existingMembership) {
      router.push('/braid');
      return;
    }

    if (member_count >= 3) {
      setStatus('full');
      return;
    }

    const { error: joinError } = await supabase
      .from('trinity_members')
      .insert({
        trinity_id: trinity_id,
        member_id: u.id,
      });

    if (joinError) {
      setStatus('error');
      return;
    }

    setStatus('success');
    setTimeout(() => router.push('/braid'), 1500);
  }

  async function handleGoogle() {
    sessionStorage.setItem('join_code', code);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/join/${code}`,
      },
    });
    if (error) console.error(error.message);
  }

  async function handleSendCode(e) {
    e.preventDefault();
    setOtpError('');
    setOtpLoading(true);

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setOtpError(error.message);
      setOtpLoading(false);
      return;
    }

    setCodeSent(true);
    setOtpLoading(false);
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    setOtpError('');
    setVerifying(true);

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      setOtpError(error.message);
      setVerifying(false);
      return;
    }

    if (data.user) {
      joinTrinity(data.user);
    }
  }

  if (status === 'checking' || status === 'joining') {
    return <div className="loading">Joining your braid...</div>;
  }

  if (status === 'success') {
    return (
      <div className="trinity-page">
        <h1>You&apos;re in.</h1>
        <p className="subtitle">Redirecting to your braid...</p>
      </div>
    );
  }

  if (status === 'full') {
    return (
      <div className="trinity-page">
        <h1>This braid is full</h1>
        <p className="subtitle">A braid holds three. This one is already complete.</p>
        <button className="btn btn-gold" onClick={() => router.push('/braid')}>
          Go to your braid
        </button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="trinity-page">
        <h1>Link not found</h1>
        <p className="subtitle">This invite link doesn&apos;t exist or has expired.</p>
        <button className="btn btn-gold" onClick={() => router.push('/')}>
          Go home
        </button>
      </div>
    );
  }

  // needsAuth
  return (
    <div className="doctrine">
      <h1>Join a Braid</h1>
      <p className="doctrine-subtitle">
        Someone invited you. Sign in to join.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
        <div>
          <h3>Already a member?</h3>

          {otpError && <div className="error-msg">{otpError}</div>}

          {codeSent ? (
            <form onSubmit={handleVerifyCode} style={{ marginTop: '0.75rem' }}>
              <p className="otp-instructions">
                We sent a code to <strong>{email}</strong>
              </p>

              <div className="field">
                <label>Enter your code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              <button type="submit" className="btn btn-gold btn-full" disabled={verifying}>
                {verifying ? 'Verifying...' : 'Verify & join'}
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-full"
                style={{ marginTop: '0.75rem' }}
                onClick={() => { setCodeSent(false); setToken(''); setOtpError(''); }}
              >
                Use a different email
              </button>
            </form>
          ) : (
            <>
              <button className="btn btn-google btn-full" onClick={handleGoogle} style={{ marginTop: '0.75rem', display: 'none' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" style={{ marginRight: '0.5rem' }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>

              <div className="auth-divider" style={{ display: 'none' }}>
                <span>or</span>
              </div>

              <form onSubmit={handleSendCode}>
                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-gold btn-full" disabled={otpLoading}>
                  {otpLoading ? 'Sending...' : 'Send me a code'}
                </button>
              </form>
            </>
          )}
        </div>

        <div>
          <h3>New here?</h3>
          <p>Read our beliefs and become a member first.</p>
          <button
            className="btn btn-gold"
            onClick={() => {
              sessionStorage.setItem('join_code', code);
              router.push('/doctrine');
            }}
            style={{ marginTop: '0.5rem' }}
          >
            Read the doctrine
          </button>
        </div>
      </div>
    </div>
  );
}
