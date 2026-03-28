'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
    fetchGatherings();
  }, [user, loading]);

  async function fetchGatherings() {
    try {
      const { data } = await supabase
        .from('gatherings')
        .select('*')
        .order('date', { ascending: false });

      if (data) setGatherings(data);
    } catch (e) {
      // table may not exist yet
    }
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
      <JourneyProgress completedSteps={[1, 2, 3]} />

      <h1>Sunday Night Live</h1>
      <p className="subtitle">Your regular scheduled (de)programming.</p>

      <p className="snl-intro">
        SNL is a monthly gathering for members. Part comedy show. Part church
        service. Part &ldquo;here&apos;s how J.O.B. is emerging, let&apos;s
        fucking go.&rdquo;
      </p>

      <p className="snl-intro">
        It&apos;s co-created. That means you&apos;re not always watching,
        sometimes you&apos;re the one in it.
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
        <h3>Ready to go deeper?</h3>
        <p>
          You&apos;ve shown up. You&apos;ve been braided. You&apos;ve watched the (de)programming.
          Now there&apos;s a choice in front of you.
        </p>
        <a href="/membership" className="btn btn-gold" style={{ marginTop: '0.5rem' }}>
          Cross the next threshold
        </a>
      </div>
    </div>
  );
}
