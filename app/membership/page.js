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
        As a member of our church, you&apos;ll get access to services,
        deprogramming, and community. For anyone who&apos;s done deep inner
        work and is ready to serve, we&apos;ll be happy to consider you as
        an elder. For everyone else who is still on their way in discovering
        their J.O.B., we&apos;re honored to play a part in your becoming.
      </p>

      <h2 className="threshold-video-header">Show us who you are and who you&apos;re becoming</h2>
      <p className="threshold-video-sub">
        Use this link regularly to re-introduce yourself as you change.
      </p>

      <div className="videoask-embed">
        <iframe
          src="https://www.videoask.com/fsbsy3hre"
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
