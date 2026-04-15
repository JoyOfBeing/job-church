'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../components/AuthProvider';
import JourneyProgress from '../../components/JourneyProgress';

export default function SNLPage() {
  const { user, loading, supabase } = useAuth();
  const router = useRouter();
  const [gatherings, setGatherings] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (supabase) fetchGatherings();
  }, [user, loading, supabase]);

  async function fetchGatherings() {
    const { data, error } = await supabase
      .from('gatherings')
      .select('*')
      .order('date', { ascending: false });

    if (data) setGatherings(data);
    setLoadingData(false);
  }

  if (loading || loadingData) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) return null;

  const now = new Date();
  const upcoming = gatherings.filter(g => new Date(g.date) >= now);
  const past = gatherings.filter(g => new Date(g.date) < now && g.video_url);

  return (
    <div className="snl-page">
      <JourneyProgress completedSteps={[1, 2]} />

      <h1>Sunday Night Live</h1>
      <p className="subtitle">Your regular scheduled (de)programming.</p>

      <p className="snl-intro">
        SNL is a monthly gathering for members. Part comedy show. Part church
        service. It&apos;s co-created by the elders and by you. That means
        you&apos;re not always watching &mdash; sometimes you&apos;re the one in it.
      </p>

      {upcoming.length > 0 && (
        <div className="next-gathering">
          <h3>Next Gathering</h3>
          <div className="gathering-date">
            {new Date(upcoming[0].date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          {upcoming[0].title && (
            <div className="gathering-title">{upcoming[0].title}</div>
          )}
          {upcoming[0].crowdcast_url && (
            <a
              href={upcoming[0].crowdcast_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold"
              style={{ marginTop: '0.75rem', display: 'inline-flex' }}
            >
              Watch live or replay
            </a>
          )}
        </div>
      )}

      {upcoming.length === 0 && (
        <div className="snl-coming-soon">
          <a
            href="#"
            className="btn btn-gold"
            style={{ opacity: 0.5, pointerEvents: 'none' }}
          >
            Watch live or replay &mdash; coming soon
          </a>
        </div>
      )}

      {past.length > 0 && (
        <div className="past-gatherings">
          <h3>Past Gatherings</h3>
          {past.map((g) => (
            <a
              key={g.id}
              href={g.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="gathering-card"
            >
              <span className="gathering-card-title">{g.title}</span>
              <span className="gathering-card-date">
                {new Date(g.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </a>
          ))}
        </div>
      )}

      <div className="whats-next">
        <h3>Ready for your next step?</h3>
        <p>
          You&apos;ve shown up. You&apos;ve sat in service. Now find your people
          &mdash; the ones who won&apos;t let you sleepwalk through this.
        </p>
        <Link href="/braid" className="btn btn-gold" style={{ marginTop: '0.5rem' }}>
          Find Your Braid
        </Link>
      </div>
    </div>
  );
}
