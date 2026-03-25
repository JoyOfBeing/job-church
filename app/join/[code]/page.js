'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '../../../lib/supabase';

export default function JoinPage() {
  const { code } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [status, setStatus] = useState('checking'); // checking, needsAuth, joining, full, error, success
  const [user, setUser] = useState(null);

  // Auth form state
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        joinTrinity(session.user);
      } else {
        setStatus('needsAuth');
      }
    });
  }, []);

  async function joinTrinity(u) {
    setStatus('joining');

    const { data: trinity, error: trinityError } = await supabase
      .from('trinities')
      .select('*')
      .eq('invite_code', code)
      .single();

    if (trinityError || !trinity) {
      setStatus('error');
      return;
    }

    const { data: existingMembers } = await supabase
      .from('trinity_members')
      .select('member_id')
      .eq('trinity_id', trinity.id);

    if (existingMembers?.some(m => m.member_id === u.id)) {
      router.push('/trinity');
      return;
    }

    if (existingMembers && existingMembers.length >= 3) {
      setStatus('full');
      return;
    }

    const { error: joinError } = await supabase
      .from('trinity_members')
      .insert({
        trinity_id: trinity.id,
        member_id: u.id,
      });

    if (joinError) {
      setStatus('error');
      return;
    }

    setStatus('success');
    setTimeout(() => router.push('/trinity'), 1500);
  }

  async function handleAuth(e) {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });

        if (error) {
          setAuthError(error.message);
          setAuthLoading(false);
          return;
        }

        if (data.user) {
          await supabase
            .from('members')
            .update({ name })
            .eq('id', data.user.id);

          setUser(data.user);
          joinTrinity(data.user);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setAuthError(error.message);
          setAuthLoading(false);
          return;
        }

        if (data.user) {
          setUser(data.user);
          joinTrinity(data.user);
        }
      }
    } catch (err) {
      setAuthError('Something went wrong. Please try again.');
      setAuthLoading(false);
    }
  }

  if (status === 'checking' || status === 'joining') {
    return <div className="loading">Joining your Trinity...</div>;
  }

  if (status === 'success') {
    return (
      <div className="trinity-page">
        <h1>You&apos;re in.</h1>
        <p className="subtitle">Redirecting to your Trinity...</p>
      </div>
    );
  }

  if (status === 'full') {
    return (
      <div className="trinity-page">
        <h1>This Trinity is full</h1>
        <p className="subtitle">A Trinity holds three. This one is already complete.</p>
        <button className="btn btn-gold" onClick={() => router.push('/trinity')}>
          Go to your Trinity
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

  // needsAuth — show sign up / sign in form right here
  return (
    <div className="doctrine">
      <h1>Join a Holy Trinity</h1>
      <p className="doctrine-subtitle">
        {isSignUp ? 'Create your account to join.' : 'Sign in to join.'}
      </p>

      {authError && <div className="error-msg">{authError}</div>}

      <form onSubmit={handleAuth}>
        {isSignUp && (
          <div className="field">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
        )}

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

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            minLength={6}
            required
          />
        </div>

        <button type="submit" className="btn btn-gold btn-full" disabled={authLoading}>
          {authLoading ? 'Working...' : isSignUp ? 'Sign up & join' : 'Sign in & join'}
        </button>
      </form>

      <p className="auth-switch">
        {isSignUp ? (
          <>Already a member? <button className="nav-btn" onClick={() => setIsSignUp(false)}>Sign in</button></>
        ) : (
          <>New here? <button className="nav-btn" onClick={() => setIsSignUp(true)}>Sign up</button></>
        )}
      </p>
    </div>
  );
}
