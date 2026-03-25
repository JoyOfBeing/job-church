'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';

const TRUTHS = [
  'Being human is the job. Not your title, not your output — the raw, ongoing act of being alive and awake.',
  'You already have what you need. Not someday. Not after the course. Now. The seed is in you.',
  'Suffering is not a bug. It is the curriculum. What breaks you open is what lets the light in.',
  'No one does this alone. You need witnesses. You need people who will not let you hide.',
  'You owe something to the whole. Your gifts are not yours to hoard. Offering is how you become real.',
  'The sacred is not elsewhere. It is here — in the mess, the money, the meals, the meetings. All of it.',
];

export default function DoctrinePage() {
  const router = useRouter();
  const { supabase, fetchMember } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setSubmitting(false);
        return;
      }

      if (data.user) {
        await supabase
          .from('members')
          .update({ name })
          .eq('id', data.user.id);

        await fetchMember(data.user.id);
        router.refresh();

        // Check if they came from an invite link
        const joinCode = typeof window !== 'undefined' && sessionStorage.getItem('join_code');
        if (joinCode) {
          sessionStorage.removeItem('join_code');
          router.push(`/join/${joinCode}`);
        } else {
          router.push('/trinity');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }

    setSubmitting(false);
  }

  return (
    <div className="doctrine">
      <h1>The Doctrine</h1>
      <p className="doctrine-subtitle">Six truths. Read them slowly.</p>

      <ol className="truths">
        {TRUTHS.map((truth, i) => (
          <li key={i}>{truth}</li>
        ))}
      </ol>

      <div className="breath-pause">
        Take a breath before you continue.
      </div>

      <div className="commitments">
        <label className="commitment-item">
          <input
            type="checkbox"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
          />
          <span>I&apos;m in.</span>
        </label>
      </div>

      {agreed && (
        <div className="signup-form">
          <h2>Become a Member</h2>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
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

            <button
              type="submit"
              className="btn btn-gold btn-full"
              disabled={submitting}
            >
              {submitting ? 'Creating your membership...' : 'I\u2019m in'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
