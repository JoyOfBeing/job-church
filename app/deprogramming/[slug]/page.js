'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../components/AuthProvider';
import JourneyProgress from '../../../components/JourneyProgress';
import { FLAGS } from '../../../lib/flags';

export default function TrackDetailPage() {
  const { user, member, loading, supabase } = useAuth();
  const router = useRouter();
  const { slug } = useParams();
  const [track, setTrack] = useState(null);
  const [modules, setModules] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [progress, setProgress] = useState({});
  const [loadingData, setLoadingData] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (!member?.is_committed) { router.push('/offering'); return; }
    fetchTrack();
  }, [user, member, loading, slug]);

  async function fetchTrack() {
    // Fetch track
    const { data: trackData } = await supabase
      .from('tracks')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (!trackData) {
      setLoadingData(false);
      return;
    }
    setTrack(trackData);

    // Fetch modules, enrollment, and progress in parallel
    const [modulesRes, enrollRes] = await Promise.all([
      supabase
        .from('modules')
        .select('*')
        .eq('track_id', trackData.id)
        .order('module_number'),
      supabase
        .from('enrollments')
        .select('*')
        .eq('member_id', user.id)
        .eq('track_id', trackData.id)
        .single(),
    ]);

    if (modulesRes.data) {
      setModules(modulesRes.data);

      // Fetch progress for all modules
      const moduleIds = modulesRes.data.map(m => m.id);
      if (moduleIds.length > 0) {
        const { data: progressData } = await supabase
          .from('module_progress')
          .select('*')
          .eq('member_id', user.id)
          .in('module_id', moduleIds);

        if (progressData) {
          const progressMap = {};
          progressData.forEach(p => { progressMap[p.module_id] = p; });
          setProgress(progressMap);
        }
      }
    }

    if (enrollRes.data) setEnrollment(enrollRes.data);
    setLoadingData(false);
  }

  async function handleEnroll() {
    setEnrolling(true);
    const { error } = await supabase.from('enrollments').insert({
      member_id: user.id,
      track_id: track.id,
      status: 'enrolled',
    });

    if (!error) {
      setEnrollment({ status: 'enrolled' });
    }
    setEnrolling(false);
  }

  if (!FLAGS.DEPROGRAMMING_ENABLED) {
    return (
      <div className="deprogramming-page">
        <div className="coming-soon-block">
          <h1>Coming soon.</h1>
          <Link href="/snl" className="btn btn-secondary">Back to SNL</Link>
        </div>
      </div>
    );
  }

  if (loading || loadingData) return <div className="loading">Loading...</div>;

  if (!track) {
    return (
      <div className="deprogramming-page">
        <h1>Track not found</h1>
        <Link href="/deprogramming" className="btn btn-secondary">Back to tracks</Link>
      </div>
    );
  }

  const completedCount = modules.filter(m => progress[m.id]?.status === 'completed').length;
  const allComplete = completedCount === modules.length && modules.length > 0;

  return (
    <div className="deprogramming-page">
      <JourneyProgress completedSteps={[1, 2, 3, 4]} />

      <Link href="/deprogramming" className="back-link">&larr; All tracks</Link>

      <h1>{track.title}</h1>
      {track.is_core && <span className="track-badge track-badge-core">Core Track</span>}
      <p className="track-description">{track.description}</p>

      <div className="track-meta-row">
        {track.duration_weeks && <span className="track-meta">{track.duration_weeks} weeks</span>}
        {enrollment && (
          <span className="track-meta">
            {completedCount}/{modules.length} modules complete
          </span>
        )}
      </div>

      {!enrollment ? (
        <div className="track-enroll-section">
          <button
            className="btn btn-gold btn-full"
            onClick={handleEnroll}
            disabled={enrolling}
          >
            {enrolling ? 'Enrolling...' : 'Begin this track'}
          </button>
        </div>
      ) : allComplete ? (
        <div className="track-complete-banner">
          <p>You&apos;ve completed this track.</p>
        </div>
      ) : null}

      <div className="module-list">
        <h2>Modules</h2>
        {modules.map((mod) => {
          const prog = progress[mod.id];
          const isComplete = prog?.status === 'completed';
          const isInProgress = prog?.status === 'in_progress';

          return (
            <div key={mod.id} className={`module-card ${isComplete ? 'module-card-complete' : ''}`}>
              <div className="module-card-number">{mod.module_number}</div>
              <div className="module-card-content">
                <h3>{mod.title}</h3>
                {isComplete && <span className="module-status module-status-done">Complete</span>}
                {isInProgress && <span className="module-status module-status-active">In progress</span>}
              </div>
              {enrollment && (
                <Link
                  href={`/deprogramming/${slug}/${mod.module_number}`}
                  className="btn btn-secondary btn-sm"
                >
                  {isComplete ? 'Review' : isInProgress ? 'Continue' : 'Start'}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
