'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import JourneyProgress from '../../components/JourneyProgress';

export default function ThresholdPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return null;

  return (
    <div className="threshold-page">
      <JourneyProgress completedSteps={[1]} />
      <h1>Welcome to: The Joy of Being</h1>
      <p className="threshold-intro">
        As a member of our church, you&apos;ll get access to services, regularly
        scheduled deprogramming, Magic Shows, and resonate community.
      </p>
      <p className="threshold-intro">
        For anyone who&apos;s done their deep inner work and feels ready to guide,
        there will be many paths to that. Maybe you&apos;ll be a somatic guide at a
        Magic Show. Maybe we&apos;ll invite you to become a church elder. Hell, we
        may even ordain you.
      </p>
      <p className="threshold-intro">
        For everyone else who is still discovering their J.O.B., we&apos;re honored
        to play a part in the awakening and embodiment of who you really are.
      </p>

      <h2 className="threshold-video-header">
        Now that you&apos;re here. Who are you? Who were you? Who might you be becoming?
      </h2>
      <p className="threshold-video-sub">
        And please, use this link periodically to re-introduce yourself as you evolve.
      </p>

      <div className="videoask-embed">
        <iframe
          src="https://www.videoask.com/fmtwt72ld"
          allow="camera *; microphone *; autoplay *; encrypted-media *; fullscreen *; display-capture *;"
          width="100%"
          height="600px"
          style={{ border: 'none', borderRadius: '24px' }}
        />
      </div>

      <div className="threshold-next">
        <p>
          When you&apos;re ready, your next step is to form a braid &mdash; three
          people who practice being human together. A holy trinity of sorts.
        </p>
        <button
          className="btn btn-gold"
          onClick={() => router.push('/braid')}
        >
          I&apos;m ready to start my braid
        </button>
      </div>
    </div>
  );
}
