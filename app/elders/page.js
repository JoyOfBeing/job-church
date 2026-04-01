'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../components/AuthProvider';
import JourneyProgress from '../../components/JourneyProgress';
import { FLAGS } from '../../lib/flags';

export default function EldersPage() {
  const { user, member, loading, supabase } = useAuth();
  const router = useRouter();
  const [elders, setElders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (!member?.is_committed) { router.push('/offering'); return; }
    fetchElders();
  }, [user, member, loading]);

  async function fetchElders() {
    const { data } = await supabase
      .from('elders')
      .select('*')
      .eq('is_active', true);

    if (data) setElders(data);
    setLoadingData(false);
  }

  if (!FLAGS.ELDERS_ENABLED) {
    return (
      <div className="elders-page">
        <JourneyProgress completedSteps={[1, 2, 3, 4]} />
        <div className="coming-soon-block">
          <h1>Elders are gathering.</h1>
          <p className="subtitle">They&apos;re not ready to be seen yet. Soon.</p>
          <Link href="/deprogramming" className="btn btn-secondary">Back to Deprogramming</Link>
        </div>
      </div>
    );
  }

  if (loading || loadingData) return <div className="loading">Loading...</div>;
  if (!user || !member?.is_committed) return null;

  return (
    <div className="elders-page">
      <JourneyProgress completedSteps={[1, 2, 3, 4]} />

      <h1>Elders</h1>
      <p className="subtitle">
        Guides, not gurus. People who&apos;ve done the work and hold space for yours.
      </p>

      <div className="elder-grid">
        {elders.map(elder => (
          <Link href={`/elders/${elder.id}`} key={elder.id} className="elder-card">
            {elder.photo_url && (
              <div className="elder-photo">
                <img src={elder.photo_url} alt={elder.name} />
              </div>
            )}
            <h3>{elder.name}</h3>
            {elder.specialties?.length > 0 && (
              <div className="elder-specialties">
                {elder.specialties.map((s, i) => (
                  <span key={i} className="elder-specialty-tag">{s}</span>
                ))}
              </div>
            )}
            {elder.bio && (
              <p className="elder-bio-preview">
                {elder.bio.length > 120 ? elder.bio.slice(0, 120) + '...' : elder.bio}
              </p>
            )}
          </Link>
        ))}
      </div>

      {elders.length === 0 && (
        <p className="section-desc" style={{ marginTop: '2rem' }}>
          No elders available yet. Check back soon.
        </p>
      )}
    </div>
  );
}
