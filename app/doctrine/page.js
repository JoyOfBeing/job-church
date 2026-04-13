'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import JourneyProgress from '../../components/JourneyProgress';

const BELIEFS = [
  { text: 'Being human is the job.', sub: 'We believe that the fragmentation of work and soul has done humanity a huge injustice. We\u2019re here to reintegrate.' },
  { text: 'You\u2019re the one you\u2019ve been waiting for.', sub: 'We believe all beings on this planet have an inherent knowing that does not require access through another being, concept or deity, eliminating the need for a middleman or savior.' },
  { text: 'We trust in emergence over certainty.', sub: 'We believe that nothing in life is certain and that trying to control things is where we get stuck, highlighting the paradox of both surrender and radical accountability to what\u2019s happening as the path forward.' },
  { text: 'Joy is a tool for accelerating the awakening process.', sub: 'We believe that awakening does not shy away from joy or pain, grief or anger, nor does it value any emotion over the other.' },
  { text: 'Reality is subjective.', sub: 'We believe that your truth matters and so does everyone else\u2019s. While we can work together to create a shared reality, that is not always possible. That\u2019s okay, love can still be there, even if it\u2019s from a distance.' },
  { text: 'Everything\u2019s a mirror.', sub: 'We believe reality is reflective. What you see in others lives in you. What you judge in others is asking to be integrated.' },
  { text: 'We trust in multi-intelligence.', sub: 'We believe in many forms of knowing (intuitive, somatic, cognitive, collective, etc.) and we trust in the wisdom of plants and our ancestors.' },
  { text: 'What you want matters.', sub: 'We believe that life force energy comes from desire and that it\u2019s sacred to want. Creation itself comes from want. And it\u2019s our job to understand the impact of our desires and the role the shadow plays as we suppress or control it.' },
  { text: 'You\u2019re allowed to enjoy being human.', sub: 'We believe that the world is not fundamentally broken and that heaven on earth is available through a shift in perception. We believe that laughter, creativity, love, and joy are sacred technologies of awakening.' },
  { text: 'Your soul has a unique purpose.', sub: 'We believe your unique exploration and expression of you is the sacred work. On a collective level, in order for us to build something new, we must first individually become it.' },
  { text: 'Your wholeness is a gift to the collective.', sub: 'We believe the most generous thing you can do for the world is become more fully yourself. Your integration is their invitation.' },
  { text: 'You are the magic.', sub: 'We believe that the divine expresses itself through every living being. Your magic is the offering.' },
];

export default function DoctrinePage() {
  const router = useRouter();
  const { user, supabase, fetchMember } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

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

      <ol className="truths">
        {BELIEFS.map((belief, i) => (
          <li key={i}>
            {belief.text}
            <span className="belief-sub">{belief.sub}</span>
          </li>
        ))}
      </ol>

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
