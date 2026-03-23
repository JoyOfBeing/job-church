'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import Threshold from '../../components/Threshold';

export default function JourneyPage() {
  const { user, member, loading, supabase } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState([]);
  const [loadingJourney, setLoadingJourney] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    async function fetchJourney() {
      const { data } = await supabase
        .from('journey_progress')
        .select('*')
        .eq('member_id', user.id)
        .order('threshold_number', { ascending: true });

      if (data) setProgress(data);
      setLoadingJourney(false);
    }

    fetchJourney();
  }, [user, loading]);

  function handleSave(updated) {
    setProgress((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  }

  if (loading || loadingJourney) {
    return <div className="loading">Loading your journey...</div>;
  }

  if (!user) return null;

  return (
    <div className="journey">
      <h1>Your Journey</h1>
      <p className="subtitle">
        Five thresholds. Each one asks a harder question than the last.
      </p>

      {progress.map((p) => (
        <Threshold key={p.id} progress={p} onSave={handleSave} />
      ))}

      {progress.length === 0 && (
        <p className="subtitle">
          Your journey hasn&apos;t started yet. Please contact an elder.
        </p>
      )}
    </div>
  );
}
