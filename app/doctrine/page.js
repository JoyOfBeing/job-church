'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';

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
