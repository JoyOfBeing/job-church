'use client';

import Link from 'next/link';
import { useAuth } from '../../components/AuthProvider';
import JourneyProgress from '../../components/JourneyProgress';

export default function ElderPathPage() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <div className="elder-path-page">
      <JourneyProgress completedSteps={user ? [1, 2] : []} />

      <h1>The Elder Path</h1>
      <p className="elder-path-intro">
        Elders aren&apos;t recruited. They&apos;re recognized. They&apos;re the ones who&apos;ve walked through their own fire and come out the other side &mdash; ready to hold space for others.
      </p>

      <div className="elder-path-sections">
        <div className="elder-path-card">
          <h2>What Elders Do</h2>
          <p>
            Elders guide members through deprogramming &mdash; helping them deconstruct old conditioning, integrate after plant medicine journeys, and find their way back to themselves. They hold the container so others can do their work.
          </p>
        </div>

        <div className="elder-path-card">
          <h2>Who This Is For</h2>
          <p>
            You&apos;ve done deep personal work. You&apos;ve sat with plant medicine, grief, joy, and your own shadow. You don&apos;t need to have it all figured out &mdash; but you know what it means to hold space without fixing.
          </p>
        </div>

        <div className="elder-path-card elder-path-card-cta">
          <h2>Ready?</h2>
          <p>
            If something in you recognizes this path, we want to hear from you. Tell us who you are and how you got here.
          </p>
          <Link href="/elder-apply" className="btn btn-gold" style={{ marginTop: '1rem' }}>
            Tell Us Who You Are
          </Link>
        </div>
      </div>

      <div className="elder-path-directory">
        <h2>Meet the Elders</h2>
        <p>
          These are the humans holding space in our community. Each one has walked their own path and now guides others on theirs.
        </p>
        <Link href="/elders" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          View Elders Directory
        </Link>
      </div>
    </div>
  );
}
