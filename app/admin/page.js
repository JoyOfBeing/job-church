'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';

export default function AdminPage() {
  const { user, member, loading, supabase } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [braids, setBraids] = useState([]);
  const [braidMembers, setBraidMembers] = useState({});
  const [unmatched, setUnmatched] = useState([]);
  const [gatherings, setGatherings] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [elders, setElders] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [elderApps, setElderApps] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Gathering form
  const [gTitle, setGTitle] = useState('');
  const [gDate, setGDate] = useState('');
  const [gCrowdcast, setGCrowdcast] = useState('');
  const [savingGathering, setSavingGathering] = useState(false);

  // Track form
  const [tTitle, setTTitle] = useState('');
  const [tSlug, setTSlug] = useState('');
  const [tDesc, setTDesc] = useState('');
  const [tWeeks, setTWeeks] = useState('');
  const [tIsCore, setTIsCore] = useState(false);
  const [savingTrack, setSavingTrack] = useState(false);

  // Elder form
  const [eName, setEName] = useState('');
  const [eBio, setEBio] = useState('');
  const [eSpecialties, setESpecialties] = useState('');
  const [eRate, setERate] = useState('');
  const [eMemberId, setEMemberId] = useState('');
  const [savingElder, setSavingElder] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user || !member?.is_admin) {
      router.push('/');
      return;
    }
    fetchData();
  }, [user, member, loading]);

  async function fetchData() {
    const [membersRes, braidsRes, tmRes, gatheringsRes, tracksRes, eldersRes, enrollRes, elderAppsRes] = await Promise.all([
      supabase.from('members').select('*').order('joined_at', { ascending: false }),
      supabase.from('trinities').select('*').order('created_at', { ascending: false }),
      supabase.from('trinity_members').select('*, members(name, email)'),
      supabase.from('gatherings').select('*').order('date', { ascending: false }),
      supabase.from('tracks').select('*').order('created_at', { ascending: false }),
      supabase.from('elders').select('*').order('created_at', { ascending: false }),
      supabase.from('enrollments').select('*, members(name, email), tracks(title)').order('enrolled_at', { ascending: false }),
      supabase.from('elder_applications').select('*').order('created_at', { ascending: false }),
    ]);

    if (membersRes.data) {
      setMembers(membersRes.data);
      setUnmatched(membersRes.data.filter(m => m.wants_match));
    }

    if (braidsRes.data) setBraids(braidsRes.data);

    if (tmRes.data) {
      const grouped = {};
      tmRes.data.forEach(tm => {
        if (!grouped[tm.trinity_id]) grouped[tm.trinity_id] = [];
        grouped[tm.trinity_id].push(tm);
      });
      setBraidMembers(grouped);
    }

    if (gatheringsRes.data) setGatherings(gatheringsRes.data);
    if (tracksRes.data) setTracks(tracksRes.data);
    if (eldersRes.data) setElders(eldersRes.data);
    if (enrollRes.data) setEnrollments(enrollRes.data);
    if (elderAppsRes.data) setElderApps(elderAppsRes.data);

    setLoadingData(false);
  }

  async function addGathering(e) {
    e.preventDefault();
    setSavingGathering(true);

    await supabase.from('gatherings').insert({
      title: gTitle,
      date: new Date(gDate).toISOString(),
      crowdcast_url: gCrowdcast || null,
      video_url: gCrowdcast || null,
    });

    setGTitle('');
    setGDate('');
    setGCrowdcast('');
    setSavingGathering(false);
    fetchData();
  }

  async function deleteGathering(id) {
    await supabase.from('gatherings').delete().eq('id', id);
    fetchData();
  }

  async function addTrack(e) {
    e.preventDefault();
    setSavingTrack(true);
    await supabase.from('tracks').insert({
      title: tTitle,
      slug: tSlug,
      description: tDesc || null,
      duration_weeks: tWeeks ? parseInt(tWeeks) : null,
      is_core: tIsCore,
      is_published: false,
    });
    setTTitle(''); setTSlug(''); setTDesc(''); setTWeeks(''); setTIsCore(false);
    setSavingTrack(false);
    fetchData();
  }

  async function toggleTrackPublished(track) {
    await supabase.from('tracks').update({ is_published: !track.is_published }).eq('id', track.id);
    fetchData();
  }

  async function deleteTrack(id) {
    await supabase.from('tracks').delete().eq('id', id);
    fetchData();
  }

  async function addElder(e) {
    e.preventDefault();
    setSavingElder(true);
    await supabase.from('elders').insert({
      name: eName,
      bio: eBio || null,
      specialties: eSpecialties ? eSpecialties.split(',').map(s => s.trim()) : [],
      hourly_rate_cents: eRate ? parseInt(eRate) * 100 : null,
      member_id: eMemberId || null,
      is_active: false,
    });
    setEName(''); setEBio(''); setESpecialties(''); setERate(''); setEMemberId('');
    setSavingElder(false);
    fetchData();
  }

  async function updateAppStatus(id, status) {
    await supabase.from('elder_applications').update({ status }).eq('id', id);
    fetchData();
  }

  async function toggleElderActive(elder) {
    await supabase.from('elders').update({ is_active: !elder.is_active }).eq('id', elder.id);
    fetchData();
  }

  async function toggleElderBadge(memberId, currentValue) {
    await supabase.from('members').update({ is_elder: !currentValue }).eq('id', memberId);
    fetchData();
  }

  if (loading || loadingData) {
    return <div className="loading">Loading admin...</div>;
  }

  if (!member?.is_admin) return null;

  // — Funnel metrics —
  const totalMembers = members.length;
  const braidedIds = new Set();
  Object.values(braidMembers).forEach(group => {
    group.forEach(tm => { if (tm.member_id) braidedIds.add(tm.member_id); });
  });
  const braidedCount = braidedIds.size;
  const committedCount = members.filter(m => m.is_committed).length;
  const enrolledIds = new Set(enrollments.map(e => e.member_id));
  const enrolledCount = enrolledIds.size;
  const coreCompleteCount = members.filter(m => m.core_track_completed).length;

  const funnel = [
    { label: 'Members', count: totalMembers },
    { label: 'Braided', count: braidedCount },
    { label: 'Committed', count: committedCount },
    { label: 'Enrolled', count: enrolledCount },
    { label: 'Core Complete', count: coreCompleteCount },
  ];

  // — Growth: group members by month —
  function groupByMonth(items, dateField) {
    const months = {};
    items.forEach(item => {
      const d = item[dateField];
      if (!d) return;
      const key = d.slice(0, 7); // "2026-03"
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months).sort((a, b) => a[0].localeCompare(b[0]));
  }

  const membersByMonth = groupByMonth(members, 'joined_at');
  const committedMembers = members.filter(m => m.is_committed);
  const committedByMonth = groupByMonth(committedMembers, 'committed_at');

  function formatMonth(key) {
    const [y, m] = key.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }

  return (
    <div className="admin">
      <h1>Admin</h1>
      <p className="subtitle">Manage members, braids, and gatherings.</p>

      {/* DASHBOARD */}
      <div className="admin-section">
        <h2>Dashboard</h2>

        <h3 style={{ marginBottom: '0.75rem' }}>Funnel</h3>
        <div className="funnel">
          {funnel.map((step, i) => {
            const pct = totalMembers > 0 ? Math.round((step.count / totalMembers) * 100) : 0;
            const dropoff = i > 0 ? funnel[i - 1].count - step.count : null;
            return (
              <div key={step.label} className="funnel-step">
                <div className="funnel-bar-wrap">
                  <div className="funnel-bar" style={{ width: `${Math.max(pct, 4)}%` }} />
                </div>
                <div className="funnel-label">
                  <span className="funnel-name">{step.label}</span>
                  <span className="funnel-count">{step.count}</span>
                  {dropoff !== null && dropoff > 0 && (
                    <span className="funnel-dropoff">-{dropoff}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <h3 style={{ marginTop: '2rem', marginBottom: '0.75rem' }}>Growth</h3>
        <div className="growth-table">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>New Members</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {membersByMonth.map(([month, count], i) => {
                const cumulative = membersByMonth.slice(0, i + 1).reduce((s, [, c]) => s + c, 0);
                return (
                  <tr key={month}>
                    <td>{formatMonth(month)}</td>
                    <td>{count}</td>
                    <td>{cumulative}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {committedByMonth.length > 0 && (
            <table style={{ marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>New Committed</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {committedByMonth.map(([month, count], i) => {
                  const cumulative = committedByMonth.slice(0, i + 1).reduce((s, [, c]) => s + c, 0);
                  return (
                    <tr key={month}>
                      <td>{formatMonth(month)}</td>
                      <td>{count}</td>
                      <td>{cumulative}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>

      <div className="admin-section">
        <h2>Members ({members.length})</h2>
        {members.map(m => (
          <div key={m.id} className="member-card">
            <div className="member-header">
              <div>
                <div className="member-name">
                  {m.name || 'Unnamed'}
                  {m.is_committed && <span className="admin-badge admin-badge-gold"> Committed</span>}
                  {m.core_track_completed && <span className="admin-badge admin-badge-green"> Core Done</span>}
                  {m.is_elder && <span className="admin-badge admin-badge-gold"> Elder</span>}
                </div>
                <div className="member-email">{m.email}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => toggleElderBadge(m.id, m.is_elder)}
                >
                  {m.is_elder ? 'Remove Elder' : 'Make Elder'}
                </button>
                <div className="member-meta">
                  Joined {new Date(m.joined_at).toLocaleDateString()}
                  {m.donation_amount_cents && (
                    <div>${m.donation_amount_cents / 100}/{m.donation_frequency || 'mo'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-section">
        <h2>Braids ({braids.length})</h2>
        {braids.map(t => {
          const tMembers = braidMembers[t.id] || [];
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
        {braids.length === 0 && <p className="section-desc">No braids yet.</p>}
      </div>

      <div className="admin-section">
        <h2>Unmatched Queue ({unmatched.length})</h2>
        <p className="section-desc">Members waiting to be matched into a braid.</p>
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
            <label>Crowdcast URL (for live + replay)</label>
            <input
              type="url"
              value={gCrowdcast}
              onChange={e => setGCrowdcast(e.target.value)}
              placeholder="https://crowdcast.io/..."
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
                  {new Date(g.date).toLocaleDateString()}
                  {g.crowdcast_url ? ' — Has Crowdcast link' : ''}
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

      {/* TRACKS */}
      <div className="admin-section">
        <h2>Tracks ({tracks.length})</h2>
        <p className="section-desc">Manage deprogramming tracks. Unpublished tracks are hidden from members.</p>

        <form onSubmit={addTrack} style={{ marginBottom: '1.5rem' }}>
          <div className="field">
            <label>Title</label>
            <input type="text" value={tTitle} onChange={e => setTTitle(e.target.value)} placeholder="Track title" required />
          </div>
          <div className="field">
            <label>Slug</label>
            <input type="text" value={tSlug} onChange={e => setTSlug(e.target.value)} placeholder="url-friendly-slug" required />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={tDesc} onChange={e => setTDesc(e.target.value)} placeholder="What is this track about?" rows={2} />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Duration (weeks)</label>
              <input type="number" value={tWeeks} onChange={e => setTWeeks(e.target.value)} placeholder="6" />
            </div>
            <label className="commitment-item" style={{ flex: 1, alignSelf: 'flex-end' }}>
              <input type="checkbox" checked={tIsCore} onChange={e => setTIsCore(e.target.checked)} />
              <span>Core track</span>
            </label>
          </div>
          <button type="submit" className="btn btn-gold" disabled={savingTrack}>
            {savingTrack ? 'Saving...' : 'Add track'}
          </button>
        </form>

        {tracks.map(t => (
          <div key={t.id} className="member-card">
            <div className="member-header">
              <div>
                <div className="member-name">
                  {t.title}
                  {t.is_core && <span className="admin-badge admin-badge-gold"> Core</span>}
                  <span className={`admin-badge ${t.is_published ? 'admin-badge-green' : 'admin-badge-dim'}`}>
                    {t.is_published ? ' Published' : ' Draft'}
                  </span>
                </div>
                <div className="member-email">/{t.slug} — {t.duration_weeks || '?'} weeks</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => toggleTrackPublished(t)}>
                  {t.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => deleteTrack(t.id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {tracks.length === 0 && <p className="section-desc">No tracks yet.</p>}
      </div>

      {/* ELDER APPLICATIONS */}
      <div className="admin-section">
        <h2>Elder Interest ({elderApps.length})</h2>
        <p className="section-desc">People who&apos;ve expressed interest in serving as an elder.</p>
        {elderApps.map(app => (
          <div key={app.id} className="member-card">
            <div className="member-header">
              <div style={{ flex: 1 }}>
                <div className="member-name">
                  {app.name}
                  <span className={`admin-badge ${
                    app.status === 'accepted' ? 'admin-badge-green' :
                    app.status === 'reviewing' ? 'admin-badge-gold' :
                    app.status === 'declined' ? 'admin-badge-dim' : ''
                  }`}>
                    {' '}{app.status}
                  </span>
                </div>
                <div className="member-email">{app.email}{app.phone ? ` — ${app.phone}` : ''}</div>
                <div className="member-email">{app.location}</div>
                <details style={{ marginTop: '0.5rem' }}>
                  <summary style={{ cursor: 'pointer', opacity: 0.7 }}>View full response</summary>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    <p><strong>Background:</strong> {app.background}</p>
                    <p><strong>Deconstruction:</strong> {app.deconstruction}</p>
                    {app.plant_medicine && <p><strong>Plant medicine:</strong> {app.plant_medicine}</p>}
                    <p><strong>Ceremony:</strong> {app.ceremony}</p>
                    <p><strong>Modalities:</strong> {app.modalities}</p>
                    <p><strong>Why elder:</strong> {app.why_elder}</p>
                    <p><strong>Availability:</strong> {app.availability}</p>
                    {app.links && <p><strong>Links:</strong> {app.links}</p>}
                  </div>
                </details>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-start' }}>
                {app.status !== 'reviewing' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => updateAppStatus(app.id, 'reviewing')}>
                    Review
                  </button>
                )}
                {app.status !== 'accepted' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => updateAppStatus(app.id, 'accepted')}>
                    Accept
                  </button>
                )}
                {app.status !== 'declined' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => updateAppStatus(app.id, 'declined')}>
                    Decline
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {elderApps.length === 0 && <p className="section-desc">No submissions yet.</p>}
      </div>

      {/* ELDERS */}
      <div className="admin-section">
        <h2>Elders ({elders.length})</h2>
        <p className="section-desc">Manage elder profiles. Inactive elders are hidden from members.</p>

        <form onSubmit={addElder} style={{ marginBottom: '1.5rem' }}>
          <div className="field">
            <label>Name</label>
            <input type="text" value={eName} onChange={e => setEName(e.target.value)} placeholder="Elder name" required />
          </div>
          <div className="field">
            <label>Bio</label>
            <textarea value={eBio} onChange={e => setEBio(e.target.value)} placeholder="About this elder" rows={2} />
          </div>
          <div className="field">
            <label>Specialties (comma-separated)</label>
            <input type="text" value={eSpecialties} onChange={e => setESpecialties(e.target.value)} placeholder="Grief, Boundaries, Play" />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Hourly rate ($)</label>
              <input type="number" value={eRate} onChange={e => setERate(e.target.value)} placeholder="100" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Member ID (optional)</label>
              <input type="text" value={eMemberId} onChange={e => setEMemberId(e.target.value)} placeholder="UUID" />
            </div>
          </div>
          <button type="submit" className="btn btn-gold" disabled={savingElder}>
            {savingElder ? 'Saving...' : 'Add elder'}
          </button>
        </form>

        {elders.map(e => (
          <div key={e.id} className="member-card">
            <div className="member-header">
              <div>
                <div className="member-name">
                  {e.name}
                  <span className={`admin-badge ${e.is_active ? 'admin-badge-green' : 'admin-badge-dim'}`}>
                    {e.is_active ? ' Active' : ' Inactive'}
                  </span>
                </div>
                <div className="member-email">
                  {e.specialties?.join(', ') || 'No specialties'}
                  {e.hourly_rate_cents ? ` — $${e.hourly_rate_cents / 100}/hr` : ''}
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => toggleElderActive(e)}>
                {e.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
        {elders.length === 0 && <p className="section-desc">No elders yet.</p>}
      </div>

      {/* ENROLLMENTS */}
      <div className="admin-section">
        <h2>Enrollments ({enrollments.length})</h2>
        <p className="section-desc">Members enrolled in tracks.</p>
        {enrollments.map(e => (
          <div key={e.id} className="member-card">
            <div className="member-header">
              <div>
                <div className="member-name">{e.members?.name || 'Unknown'}</div>
                <div className="member-email">
                  {e.tracks?.title || 'Unknown track'} — {e.status}
                  {e.donation_amount_cents ? ` — $${e.donation_amount_cents / 100}` : ''}
                </div>
              </div>
              <div className="member-meta">
                {new Date(e.enrolled_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
        {enrollments.length === 0 && <p className="section-desc">No enrollments yet.</p>}
      </div>

      {/* COMMITTED MEMBERS SUMMARY */}
      <div className="admin-section">
        <h2>Committed Members ({members.filter(m => m.is_committed).length})</h2>
        <p className="section-desc">Members who have crossed the membership threshold.</p>
        {members.filter(m => m.is_committed).map(m => (
          <div key={m.id} className="member-card">
            <div className="member-header">
              <div>
                <div className="member-name">{m.name || 'Unnamed'}</div>
                <div className="member-email">
                  Committed {m.committed_at ? new Date(m.committed_at).toLocaleDateString() : 'unknown'}
                  {m.donation_amount_cents ? ` — $${m.donation_amount_cents / 100}/${m.donation_frequency || 'mo'}` : ''}
                </div>
              </div>
            </div>
          </div>
        ))}
        {members.filter(m => m.is_committed).length === 0 && <p className="section-desc">No committed members yet.</p>}
      </div>
    </div>
  );
}
