'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../components/AuthProvider';
import JourneyProgress from '../../components/JourneyProgress';
import { FLAGS } from '../../lib/flags';

export default function DeprogrammingPage() {
  const { user, member, loading, supabase } = useAuth();
  const router = useRouter();
  const [tracks, setTracks] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!member?.is_committed) {
      router.push('/offering');
      return;
    }
    fetchData();
  }, [user, member, loading]);

  async function fetchData() {
    const [tracksRes, enrollRes] = await Promise.all([
      supabase.from('tracks').select('*').eq('is_published', true).order('is_core', { ascending: false }),
      supabase.from('enrollments').select('*').eq('member_id', user.id),
    ]);

    if (tracksRes.data) setTracks(tracksRes.data);
    if (enrollRes.data) setEnrollments(enrollRes.data);
    setLoadingData(false);
  }

  if (!FLAGS.DEPROGRAMMING_ENABLED) {
    return (
      <div className="deprogramming-page">
        <JourneyProgress completedSteps={[1, 2, 3, 4]} />
        <div className="coming-soon-block">
          <h1>Deprogramming is coming.</h1>
          <p className="subtitle">The tracks are being built. The elders are preparing. Sit tight.</p>
          <Link href="/snl" className="btn btn-secondary">Back to SNL</Link>
        </div>
      </div>
    );
  }

  if (loading || loadingData) return <div className="loading">Loading...</div>;
  if (!user || !member?.is_committed) return null;

  const enrolledTrackIds = new Set(enrollments.map(e => e.track_id));
  const coreTracks = tracks.filter(t => t.is_core);
  const addonTracks = tracks.filter(t => !t.is_core);

  return (
    <div className="deprogramming-page">
      <JourneyProgress completedSteps={[1, 2, 3, 4]} />

      <h1>Deprogramming</h1>
      <p className="subtitle">Unlearn what was never yours. Return to what is.</p>

      {coreTracks.length > 0 && (
        <div className="track-section">
          <h2>The Core Track</h2>
          <p className="section-desc">Required before offering services on the JOB Board.</p>
          {coreTracks.map(track => (
            <Link href={`/deprogramming/${track.slug}`} key={track.id} className="track-card track-card-core">
              <div className="track-card-header">
                <h3>{track.title}</h3>
                {enrolledTrackIds.has(track.id) && (
                  <span className="track-badge track-badge-enrolled">Enrolled</span>
                )}
              </div>
              <p>{track.description}</p>
              {track.duration_weeks && (
                <span className="track-meta">{track.duration_weeks} weeks</span>
              )}
            </Link>
          ))}
        </div>
      )}

      {addonTracks.length > 0 && (
        <div className="track-section">
          <h2>Add-On Tracks</h2>
          <p className="section-desc">Elder-led deep dives. Enroll solo or with your braid.</p>
          <div className="track-grid">
            {addonTracks.map(track => (
              <Link href={`/deprogramming/${track.slug}`} key={track.id} className="track-card">
                <div className="track-card-header">
                  <h3>{track.title}</h3>
                  {enrolledTrackIds.has(track.id) && (
                    <span className="track-badge track-badge-enrolled">Enrolled</span>
                  )}
                </div>
                <p>{track.description}</p>
                <div className="track-card-footer">
                  {track.duration_weeks && (
                    <span className="track-meta">{track.duration_weeks} weeks</span>
                  )}
                  {track.suggested_donation_cents && (
                    <span className="track-meta">Suggested: ${track.suggested_donation_cents / 100}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {tracks.length === 0 && (
        <p className="section-desc" style={{ marginTop: '2rem' }}>No tracks available yet. Check back soon.</p>
      )}
    </div>
  );
}
