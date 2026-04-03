'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import JourneyProgress from '../../components/JourneyProgress';

const BELIEFS = [
  { text: 'Being human is the job.', sub: 'The fragmentation of work and soul did humanity a huge injustice. We\u2019re here to reintegrate.' },
  { text: 'You\u2019re the one you\u2019ve been waiting for.', sub: 'You\u2019re not broken. You have everything you need inside of you.' },
  { text: 'We follow emergence over certainty.', sub: 'Nothing in life is certain. And trying to control things gets us stuck.' },
  { text: 'Grief and suffering are part of it.', sub: 'You don\u2019t get to bypass them.' },
  { text: 'Everything\u2019s a mirror.', sub: 'No one can walk your path but you, but you don\u2019t have to do it alone.' },
  { text: 'Reality is subjective.', sub: 'Your truth matters. And so does someone else\u2019s. If you can\u2019t create a shared reality, that\u2019s ok. There can still be love there.' },
  { text: 'We trust in multi-intelligence.', sub: 'Your body knows before your mind does. Learn how to listen to it.' },
  { text: 'What you want matters.', sub: 'Life force energy comes from desire. Shadow comes from suppressing it. Creation itself comes from want.' },
  { text: 'You are the magic.', sub: 'Figure out who you are and then share it. Your magic is the offering.' },
  { text: 'Everything is sacred, even you.', sub: 'As above, so below. As without, so within.' },
  { text: 'You\u2019re allowed to enjoy being human.', sub: 'Following your aliveness is the secret to healing the trauma of coming into form.' },
  { text: 'Your soul has a unique purpose in co-creating a new reality.', sub: 'But in order to build something new, you must first become it.' },
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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

    if (!firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }
    if (!lastName.trim()) {
      setError('Please enter your last name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }

    setSubmitting(true);

    try {
      const currentUser = user || (await supabase.auth.getUser()).data.user;
      await supabase
        .from('members')
        .update({ name: `${firstName.trim()} ${lastName.trim()}`, phone: phone.trim() })
        .eq('id', currentUser.id);

      await fetchMember(currentUser.id);

      const joinCode = typeof window !== 'undefined' && sessionStorage.getItem('join_code');
      if (joinCode) {
        sessionStorage.removeItem('join_code');
        router.push(`/join/${joinCode}`);
      } else {
        router.push('/membership');
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
              <label>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                required
              />
            </div>

            <div className="field">
              <label>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
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
                required
              />
            </div>

            <p style={{ fontSize: '0.8rem', color: '#999aab', lineHeight: 1.6 }}>
              By joining, you agree to our{' '}
              <a href="/terms" target="_blank" style={{ color: '#2dd4bf' }}>Terms of Membership</a> and{' '}
              <a href="/privacy" target="_blank" style={{ color: '#2dd4bf' }}>Privacy Policy</a>.
            </p>

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
