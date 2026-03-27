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
      <h1>You just crossed your first threshold.</h1>
      <p className="threshold-intro">
        You went from someone looking at this to someone who&apos;s in it.
        That&apos;s not small. Welcome.
      </p>

      <p className="threshold-intro">
        Before you do anything else, we want to meet you. Hit play and
        introduce yourself.
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
          people who practice being human together.
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
