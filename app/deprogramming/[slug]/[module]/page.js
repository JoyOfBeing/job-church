'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../components/AuthProvider';
import { FLAGS } from '../../../../lib/flags';

export default function ModulePage() {
  const { user, member, loading, supabase, fetchMember } = useAuth();
  const router = useRouter();
  const { slug, module: moduleNum } = useParams();
  const [track, setTrack] = useState(null);
  const [mod, setMod] = useState(null);
  const [allModules, setAllModules] = useState([]);
  const [progressRecord, setProgressRecord] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (!member?.is_committed) { router.push('/offering'); return; }
    fetchModule();
  }, [user, member, loading, slug, moduleNum]);

  async function fetchModule() {
    // Get track
    const { data: trackData } = await supabase
      .from('tracks')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (!trackData) { setLoadingData(false); return; }
    setTrack(trackData);

    // Get all modules for this track + the specific one
    const { data: modulesData } = await supabase
      .from('modules')
      .select('*')
      .eq('track_id', trackData.id)
      .order('module_number');

    if (modulesData) {
      setAllModules(modulesData);
      const current = modulesData.find(m => m.module_number === parseInt(moduleNum));
      setMod(current);

      if (current) {
        // Get or create progress
        const { data: prog } = await supabase
          .from('module_progress')
          .select('*')
          .eq('member_id', user.id)
          .eq('module_id', current.id)
          .single();

        if (prog) {
          setProgressRecord(prog);
        } else {
          // Create progress record as in_progress
          const { data: newProg } = await supabase
            .from('module_progress')
            .insert({ member_id: user.id, module_id: current.id, status: 'in_progress' })
            .select()
            .single();
          if (newProg) setProgressRecord(newProg);
        }
      }
    }
    setLoadingData(false);
  }

  async function markComplete() {
    if (!mod || !progressRecord) return;
    setSaving(true);

    await supabase
      .from('module_progress')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', progressRecord.id);

    setProgressRecord({ ...progressRecord, status: 'completed' });

    // Check if all modules in this track are now complete
    const { data: allProgress } = await supabase
      .from('module_progress')
      .select('*')
      .in('module_id', allModules.map(m => m.id))
      .eq('member_id', user.id);

    const completedIds = new Set(
      (allProgress || []).filter(p => p.status === 'completed' || p.module_id === mod.id).map(p => p.module_id)
    );
    // Include the one we just completed
    completedIds.add(mod.id);

    if (completedIds.size === allModules.length && track.is_core) {
      // All core track modules done — mark core_track_completed
      await supabase
        .from('members')
        .update({
          core_track_completed: true,
          core_track_completed_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      // Update enrollment status
      await supabase
        .from('enrollments')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('member_id', user.id)
        .eq('track_id', track.id);

      fetchMember(user.id);
    }

    setSaving(false);
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

  if (!mod) {
    return (
      <div className="deprogramming-page">
        <h1>Module not found</h1>
        <Link href={`/deprogramming/${slug}`} className="btn btn-secondary">Back to track</Link>
      </div>
    );
  }

  const currentIndex = allModules.findIndex(m => m.id === mod.id);
  const prevModule = currentIndex > 0 ? allModules[currentIndex - 1] : null;
  const nextModule = currentIndex < allModules.length - 1 ? allModules[currentIndex + 1] : null;
  const isComplete = progressRecord?.status === 'completed';

  return (
    <div className="module-page">
      <Link href={`/deprogramming/${slug}`} className="back-link">
        &larr; {track?.title}
      </Link>

      <div className="module-header">
        <span className="module-number-label">Module {mod.module_number}</span>
        <h1>{mod.title}</h1>
      </div>

      {mod.video_url && (
        <div className="video-embed">
          <iframe
            src={mod.video_url}
            allowFullScreen
            allow="autoplay; encrypted-media"
          />
        </div>
      )}

      <div
        className="module-content"
        dangerouslySetInnerHTML={{ __html: mod.content_html }}
      />

      {mod.prompt && (
        <div className="module-prompt">
          <h3>Reflection</h3>
          <p>{mod.prompt}</p>
        </div>
      )}

      <div className="module-actions">
        {!isComplete ? (
          <button
            className="btn btn-gold btn-full"
            onClick={markComplete}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Mark complete'}
          </button>
        ) : (
          <div className="module-complete-banner">
            Module complete &#10003;
          </div>
        )}
      </div>

      <div className="module-nav">
        {prevModule ? (
          <Link href={`/deprogramming/${slug}/${prevModule.module_number}`} className="btn btn-secondary">
            &larr; Previous
          </Link>
        ) : <div />}
        {nextModule ? (
          <Link href={`/deprogramming/${slug}/${nextModule.module_number}`} className="btn btn-secondary">
            Next &rarr;
          </Link>
        ) : (
          <Link href={`/deprogramming/${slug}`} className="btn btn-secondary">
            Back to track
          </Link>
        )}
      </div>
    </div>
  );
}
