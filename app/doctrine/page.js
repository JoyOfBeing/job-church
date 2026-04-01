'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import JourneyProgress from '../../components/JourneyProgress';

const BELIEFS = [
  { text: 'Being human is the job.', sub: 'Everything else is secondary.' },
  { text: 'You already have what you need.', sub: 'You\u2019re not broken. You\u2019re not lacking.' },
  { text: 'The path is never certain.', sub: 'You walk it into existence.' },
  { text: 'Grief and suffering are part of it.', sub: 'You don\u2019t get to bypass them.' },
  { text: 'You can\u2019t do this alone.', sub: 'You need people who see you clearly.' },
  { text: 'Telling the truth moves things.', sub: 'Even when it costs you.' },
  { text: 'Your body knows before your mind does.', sub: 'Learn how to listen to it.' },
  { text: 'What you want matters.', sub: 'More than what you think you should want.' },
  { text: 'Your gifts aren\u2019t just for you.', sub: 'They become magic when you offer them.' },
  { text: 'The sacred isn\u2019t somewhere else.', sub: 'Everything is sacred, even you.' },
  { text: 'You\u2019re allowed to enjoy being here.', sub: 'Aliveness is the prerequisite to the final step.' },
  { text: 'You\u2019re invited to co-create a new reality.', sub: 'But in order to build something new, you must first become it.' },
];

export default function DoctrinePage() {
  const router = useRouter();
  const { user, supabase, fetchMember } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [revealedCount, setRevealedCount] = useState(0);
  const allRevealed = revealedCount >= BELIEFS.length;
  const beliefRefs = useRef([]);

  // OTP state
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Profile completion state (shown after auth)
  const [showProfile, setShowProfile] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function revealBelief(index) {
    if (index !== revealedCount) return;
    const next = revealedCount + 1;
    setRevealedCount(next);
    // Scroll the next belief into view (or the breath-pause if all revealed)
    setTimeout(() => {
      const target = beliefRefs.current[next] || document.querySelector('.breath-pause');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  }

  // When user signs in via OAuth and returns, check if they need profile info
  useEffect(() => {
    if (user && agreed) {
      setShowProfile(true);
    }
  }, [user, agreed]);

  // Check on mount if returning from OAuth
  useEffect(() => {
    if (user && sessionStorage.getItem('doctrine_agreed') === 'true') {
      sessionStorage.removeItem('doctrine_agreed');
      setAgreed(true);

      // Check if returning user already has a profile
      supabase
        .from('members')
        .select('name')
        .eq('id', user.id)
        .single()
        .then(({ data: existingMember }) => {
          if (existingMember?.name) {
            const joinCode = sessionStorage.getItem('join_code');
            if (joinCode) {
              sessionStorage.removeItem('join_code');
              window.location.href = `/join/${joinCode}`;
            } else {
              window.location.href = '/braid';
            }
          } else {
            setShowProfile(true);
          }
        });
    }
  }, [user]);

  async function handleSendCode(e) {
    e.preventDefault();
    setError('');
    setOtpLoading(true);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
    });

    if (otpError) {
      setError(otpError.message);
      setOtpLoading(false);
      return;
    }

    setCodeSent(true);
    setOtpLoading(false);
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    setError('');
    setVerifying(true);

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (verifyError) {
      setError(verifyError.message);
      setVerifying(false);
      return;
    }

    if (data.user) {
      // Check if this is a returning user with an existing profile
      const { data: existingMember } = await supabase
        .from('members')
        .select('name')
        .eq('id', data.user.id)
        .single();

      if (existingMember?.name) {
        // Existing member — send them to their braid
        const joinCode = typeof window !== 'undefined' && sessionStorage.getItem('join_code');
        if (joinCode) {
          sessionStorage.removeItem('join_code');
          window.location.href = `/join/${joinCode}`;
        } else {
          window.location.href = '/braid';
        }
        return;
      }

      // New user — collect profile info
      setShowProfile(true);
    }
  }

  async function handleGoogle() {
    sessionStorage.setItem('doctrine_agreed', 'true');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/doctrine`,
      },
    });
    if (error) setError(error.message);
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const currentUser = user || (await supabase.auth.getUser()).data.user;
      await supabase
        .from('members')
        .update({ name, phone })
        .eq('id', currentUser.id);

      await fetchMember(currentUser.id);

      const joinCode = typeof window !== 'undefined' && sessionStorage.getItem('join_code');
      if (joinCode) {
        sessionStorage.removeItem('join_code');
        router.push(`/join/${joinCode}`);
      } else {
        router.push('/threshold');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }

    setSubmitting(false);
  }

  // Signed-in members just see the beliefs (no sign-up form)
  if (user && !showProfile) {
    return (
      <div className="doctrine">
        <JourneyProgress completedSteps={[1]} />
        <h1>The J.O.B. Doctrine</h1>
        <p className="doctrine-subtitle">The 12 steps back to you</p>

        <ol className="truths">
          {BELIEFS.map((belief, i) => (
            <li key={i}>
              {belief.text}
              <span className="belief-sub">{belief.sub}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  // Profile completion step (after auth)
  if ((user || codeSent) && showProfile) {
    return (
      <div className="doctrine">
        <h1>Almost there</h1>
        <p className="doctrine-subtitle">Tell us a little about yourself.</p>

        {error && <div className="error-msg">{error}</div>}

        <div className="signup-form">
          <form onSubmit={handleProfileSubmit}>
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

            <div className="field">
              <label>Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            <button
              type="submit"
              className="btn btn-gold btn-full"
              disabled={submitting}
            >
              {submitting ? 'Creating your membership...' : 'I\u2019m in'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="doctrine">
      <h1>The J.O.B. Doctrine</h1>
      <p className="doctrine-subtitle">The 12 steps back to you</p>

      <ol className="truths truths-reveal">
        {BELIEFS.map((belief, i) => {
          const isRevealed = i < revealedCount;
          const isReady = i === revealedCount;
          return (
            <li
              key={i}
              ref={el => beliefRefs.current[i] = el}
              className={
                isRevealed ? 'belief-revealed' :
                isReady ? 'belief-ready' :
                'belief-hidden'
              }
              onClick={() => revealBelief(i)}
              role={isReady ? 'button' : undefined}
              tabIndex={isReady ? 0 : undefined}
              onKeyDown={isReady ? (e) => { if (e.key === 'Enter' || e.key === ' ') revealBelief(i); } : undefined}
            >
              {belief.text}
              <span className="belief-sub">{belief.sub}</span>
            </li>
          );
        })}
      </ol>

      {allRevealed && (
        <>
          <div className="breath-pause">
            Are you willing to put these beliefs into practice?
          </div>

          <div className="commitments">
            <label className="commitment-item">
              <input
                type="checkbox"
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
              />
              <span>I AM</span>
            </label>
          </div>
        </>
      )}

      {agreed && (
        <div className="signup-form">
          <h2>Become a Member</h2>

          {error && <div className="error-msg">{error}</div>}

          {codeSent ? (
            <form onSubmit={handleVerifyCode}>
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
                {verifying ? 'Verifying...' : 'Verify'}
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-full"
                style={{ marginTop: '0.75rem' }}
                onClick={() => { setCodeSent(false); setToken(''); setError(''); }}
              >
                Use a different email
              </button>
            </form>
          ) : (
            <>
              <button className="btn btn-google btn-full" onClick={handleGoogle}>
                <svg viewBox="0 0 24 24" width="20" height="20" style={{ marginRight: '0.5rem' }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              </button>

              <div className="auth-divider">
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
      )}
    </div>
  );
}
