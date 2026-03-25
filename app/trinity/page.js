'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';

export default function TrinityPage() {
  const { user, member, loading, supabase } = useAuth();
  const router = useRouter();
  const [trinity, setTrinity] = useState(null);
  const [members, setMembers] = useState([]);
  const [gatherings, setGatherings] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joiningQueue, setJoiningQueue] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchTrinity();
    fetchGatherings();
  }, [user, loading]);

  async function fetchTrinity() {
    // Find trinity this member belongs to
    const { data: myMembership } = await supabase
      .from('trinity_members')
      .select('trinity_id')
      .eq('member_id', user.id)
      .limit(1)
      .single();

    if (myMembership) {
      const { data: trinityData } = await supabase
        .from('trinities')
        .select('*')
        .eq('id', myMembership.trinity_id)
        .single();

      if (trinityData) {
        setTrinity(trinityData);

        const { data: trinityMembers } = await supabase
          .from('trinity_members')
          .select('*, members(name, email)')
          .eq('trinity_id', trinityData.id);

        if (trinityMembers) setMembers(trinityMembers);
      }
    }

    setLoadingData(false);
  }

  async function fetchGatherings() {
    const { data } = await supabase
      .from('gatherings')
      .select('*')
      .order('date', { ascending: false });

    if (data) setGatherings(data);
  }

  async function createTrinity() {
    setCreating(true);
    const code = Math.random().toString(36).substring(2, 10);

    const { data: newTrinity, error } = await supabase
      .from('trinities')
      .insert({
        invite_code: code,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      setCreating(false);
      return;
    }

    await supabase
      .from('trinity_members')
      .insert({
        trinity_id: newTrinity.id,
        member_id: user.id,
      });

    setTrinity(newTrinity);
    setMembers([{ member_id: user.id, members: { name: member?.name, email: member?.email } }]);
    setCreating(false);
  }

  async function joinQueue() {
    setJoiningQueue(true);
    await supabase
      .from('members')
      .update({ wants_match: true })
      .eq('id', user.id);
    setJoiningQueue(false);
  }

  function copyInviteLink() {
    const link = `${window.location.origin}/join/${trinity.invite_code}`;
    navigator.clipboard.writeText(link);
  }

  if (loading || loadingData) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) return null;

  const isComplete = members.length >= 3;
  const inviteLink = trinity ? `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${trinity.invite_code}` : '';

  // Separate gatherings into upcoming and past
  const now = new Date();
  const upcoming = gatherings.filter(g => new Date(g.date) >= now);
  const past = gatherings.filter(g => new Date(g.date) < now && g.video_url);

  return (
    <div className="trinity-page">
      <h1>Your Trinity</h1>

      {!trinity && !member?.wants_match && (
        <div className="trinity-choice">
          <p className="subtitle">
            Your first practice: find two others. Form your Holy Trinity.
          </p>

          <div className="trinity-options">
            <div className="trinity-option">
              <h3>Start a Trinity</h3>
              <p>Create one and invite two people you trust.</p>
              <button
                className="btn btn-gold"
                onClick={createTrinity}
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Start a Trinity'}
              </button>
            </div>

            <div className="trinity-option">
              <h3>I&apos;m here alone</h3>
              <p>We&apos;ll connect you with others.</p>
              <button
                className="btn btn-secondary"
                onClick={joinQueue}
                disabled={joiningQueue}
              >
                {joiningQueue ? 'Joining...' : 'Match me'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!trinity && member?.wants_match && (
        <div className="trinity-waiting">
          <h2>You&apos;re in the queue</h2>
          <p className="subtitle">
            We&apos;re forming trinities. You&apos;ll be connected soon.
          </p>
        </div>
      )}

      {trinity && !isComplete && (
        <div className="trinity-forming">
          <h2>Your Trinity is forming</h2>
          <p className="subtitle">{members.length} of 3 members</p>

          <div className="trinity-members">
            {members.map((m, i) => (
              <div key={i} className="trinity-member-card">
                <div className="trinity-member-name">
                  {m.members?.name || 'Unnamed'}
                </div>
              </div>
            ))}
            {Array.from({ length: 3 - members.length }).map((_, i) => (
              <div key={`empty-${i}`} className="trinity-member-card trinity-member-empty">
                <div className="trinity-member-name">Waiting...</div>
              </div>
            ))}
          </div>

          <div className="invite-section">
            <p className="invite-label">Share this link with your people:</p>
            <div className="invite-link-row">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="invite-input"
              />
              <button className="btn btn-gold btn-sm" onClick={copyInviteLink}>
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {trinity && isComplete && (
        <div className="trinity-complete">
          <h2>Your Trinity is formed.</h2>

          <div className="trinity-members">
            {members.map((m, i) => (
              <div key={i} className="trinity-member-card trinity-member-active">
                <div className="trinity-member-name">
                  {m.members?.name || 'Unnamed'}
                </div>
              </div>
            ))}
          </div>

          <div className="practice-section">
            <h3>The Practice</h3>
            <p className="subtitle">Five moves. No perfection required.</p>
            <ol className="practice-moves">
              <li><strong>Tell your truth</strong> — what&apos;s real right now?</li>
              <li><strong>Witness</strong> — reflect before fixing</li>
              <li><strong>Challenge</strong> — name one honest edge</li>
              <li><strong>Create</strong> — choose one next step</li>
              <li><strong>Keep it moving</strong> — don&apos;t over-process</li>
            </ol>
          </div>

          <div className="whats-next">
            <h3>What&apos;s Next</h3>
            <p>Start practicing. The next step reveals itself at Sunday Night Live.</p>
            {upcoming.length > 0 && (
              <div className="next-gathering">
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
                    className="btn btn-gold btn-sm"
                    style={{ marginTop: '0.75rem', display: 'inline-flex' }}
                  >
                    RSVP
                  </a>
                )}
              </div>
            )}
          </div>
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
    </div>
  );
}
