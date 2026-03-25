'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';

export default function AdminPage() {
  const { user, member, loading, supabase } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [trinities, setTrinities] = useState([]);
  const [trinityMembers, setTrinityMembers] = useState({});
  const [unmatched, setUnmatched] = useState([]);
  const [gatherings, setGatherings] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Gathering form
  const [gTitle, setGTitle] = useState('');
  const [gDate, setGDate] = useState('');
  const [gCrowdcast, setGCrowdcast] = useState('');
  const [gVideo, setGVideo] = useState('');
  const [savingGathering, setSavingGathering] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user || !member?.is_admin) {
      router.push('/');
      return;
    }
    fetchData();
  }, [user, member, loading]);

  async function fetchData() {
    const [membersRes, trinitiesRes, tmRes, gatheringsRes] = await Promise.all([
      supabase.from('members').select('*').order('joined_at', { ascending: false }),
      supabase.from('trinities').select('*').order('created_at', { ascending: false }),
      supabase.from('trinity_members').select('*, members(name, email)'),
      supabase.from('gatherings').select('*').order('date', { ascending: false }),
    ]);

    if (membersRes.data) {
      setMembers(membersRes.data);
      setUnmatched(membersRes.data.filter(m => m.wants_match));
    }

    if (trinitiesRes.data) setTrinities(trinitiesRes.data);

    if (tmRes.data) {
      const grouped = {};
      tmRes.data.forEach(tm => {
        if (!grouped[tm.trinity_id]) grouped[tm.trinity_id] = [];
        grouped[tm.trinity_id].push(tm);
      });
      setTrinityMembers(grouped);
    }

    if (gatheringsRes.data) setGatherings(gatheringsRes.data);

    setLoadingData(false);
  }

  async function addGathering(e) {
    e.preventDefault();
    setSavingGathering(true);

    await supabase.from('gatherings').insert({
      title: gTitle,
      date: new Date(gDate).toISOString(),
      crowdcast_url: gCrowdcast || null,
      video_url: gVideo || null,
    });

    setGTitle('');
    setGDate('');
    setGCrowdcast('');
    setGVideo('');
    setSavingGathering(false);
    fetchData();
  }

  async function deleteGathering(id) {
    await supabase.from('gatherings').delete().eq('id', id);
    fetchData();
  }

  if (loading || loadingData) {
    return <div className="loading">Loading admin...</div>;
  }

  if (!member?.is_admin) return null;

  return (
    <div className="admin">
      <h1>Admin</h1>
      <p className="subtitle">Manage members, trinities, and gatherings.</p>

      <div className="admin-section">
        <h2>Members ({members.length})</h2>
        {members.map(m => (
          <div key={m.id} className="member-card">
            <div className="member-header">
              <div>
                <div className="member-name">{m.name || 'Unnamed'}</div>
                <div className="member-email">{m.email}</div>
              </div>
              <div className="member-meta">
                Joined {new Date(m.joined_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-section">
        <h2>Trinities ({trinities.length})</h2>
        {trinities.map(t => {
          const tMembers = trinityMembers[t.id] || [];
          return (
            <div key={t.id} className="member-card">
              <div className="member-header">
                <div>
                  <div className="member-name">
                    {tMembers.map(m => m.members?.name || '?').join(', ') || 'Empty'}
                  </div>
                  <div className="member-email">
                    {tMembers.length}/3 members — code: {t.invite_code}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {trinities.length === 0 && <p className="section-desc">No trinities yet.</p>}
      </div>

      <div className="admin-section">
        <h2>Unmatched Queue ({unmatched.length})</h2>
        <p className="section-desc">Members waiting to be matched into a trinity.</p>
        {unmatched.map(m => (
          <div key={m.id} className="member-card">
            <div className="member-name">{m.name || 'Unnamed'}</div>
            <div className="member-email">{m.email}</div>
          </div>
        ))}
        {unmatched.length === 0 && <p className="section-desc">No one waiting.</p>}
      </div>

      <div className="admin-section">
        <h2>Gatherings</h2>
        <p className="section-desc">Manage Sunday Night Live and past gatherings.</p>

        <form onSubmit={addGathering} style={{ marginBottom: '1.5rem' }}>
          <div className="field">
            <label>Title</label>
            <input
              type="text"
              value={gTitle}
              onChange={e => setGTitle(e.target.value)}
              placeholder="Sunday Night Live — March 29"
              required
            />
          </div>
          <div className="field">
            <label>Date</label>
            <input
              type="datetime-local"
              value={gDate}
              onChange={e => setGDate(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Crowdcast URL (for RSVP)</label>
            <input
              type="url"
              value={gCrowdcast}
              onChange={e => setGCrowdcast(e.target.value)}
              placeholder="https://crowdcast.io/..."
            />
          </div>
          <div className="field">
            <label>Video URL (for replay — add after the event)</label>
            <input
              type="url"
              value={gVideo}
              onChange={e => setGVideo(e.target.value)}
              placeholder="https://youtube.com/..."
            />
          </div>
          <button type="submit" className="btn btn-gold" disabled={savingGathering}>
            {savingGathering ? 'Saving...' : 'Add gathering'}
          </button>
        </form>

        {gatherings.map(g => (
          <div key={g.id} className="member-card">
            <div className="member-header">
              <div>
                <div className="member-name">{g.title}</div>
                <div className="member-email">
                  {new Date(g.date).toLocaleDateString()} —
                  {g.video_url ? ' Has replay' : ' No replay yet'}
                </div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => deleteGathering(g.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
