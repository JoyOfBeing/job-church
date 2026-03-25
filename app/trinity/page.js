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
  const [copied, setCopied] = useState(false);

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

    // Mark this member as wanting a match
    await supabase
      .from('members')
      .update({ wants_match: true })
      .eq('id', user.id);

    // Check how many others are waiting
    const { data: waiting } = await supabase
      .from('members')
      .select('id, name, email')
      .eq('wants_match', true)
      .neq('id', user.id);

    if (waiting && waiting.length >= 2) {
      // Pick the first two waiting members + this user and form a braid
      const matched = [
        { id: user.id, name: member?.name, email: member?.email },
        waiting[0],
        waiting[1],
      ];
      const matchedIds = matched.map(m => m.id);
      const code = Math.random().toString(36).substring(2, 10);

      const { data: newTrinity } = await supabase
        .from('trinities')
        .insert({ invite_code: code, created_by: user.id })
        .select()
        .single();

      if (newTrinity) {
        // Add all three members
        await supabase
          .from('trinity_members')
          .insert(matchedIds.map(id => ({ trinity_id: newTrinity.id, member_id: id })));

        // Clear wants_match for all three
        await supabase
          .from('members')
          .update({ wants_match: false })
          .in('id', matchedIds);

        // Notify the other two by email (don't await — fire and forget)
        fetch('/api/notify-braid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            members: matched.filter(m => m.id !== user.id),
            braidId: newTrinity.id,
          }),
        }).catch(() => {});

        // Refresh to show the new braid
        setJoiningQueue(false);
        fetchTrinity();
        return;
      }
    }

    setJoiningQueue(false);
    // Not enough people yet — show the queue state
    if (member) member.wants_match = true;
  }

  function copyInviteLink() {
    const link = `${window.location.origin}/join/${trinity.invite_code}`;
    // Try clipboard API first, fall back to textarea trick
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => fallbackCopy(link));
    } else {
      fallbackCopy(link);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      {!trinity && !member?.wants_match && (
        <div className="trinity-choice">
          <p className="subtitle">
            You&apos;re about to embark on a magical journey: remembering who you are,
            why you&apos;re here, and your special human magic. While no one can do this
            for you, you don&apos;t have to do it alone. Plus, it doesn&apos;t work that way.
          </p>
          <p className="subtitle">
            Your first job is to form a braid &mdash; a kind of holy trinity &mdash; where
            three humans support each other into their own becomings. This is a critical
            component to the entire practice.
          </p>
          <p className="subtitle">
            And the good news is, you get to pick. Do you want to invite people you
            already know and love, or do you want to get matched with others who give
            you a clean start with new connections?
          </p>
          <p className="subtitle">
            Once you sign up, we&apos;ll give you guidelines on what to do next.
          </p>

          <div className="trinity-options">
            <div className="trinity-option">
              <h3>Start a braid</h3>
              <p>Create one and invite two people you trust.</p>
              <button
                className="btn btn-gold"
                onClick={createTrinity}
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Start a braid'}
              </button>
            </div>

            <div className="trinity-option">
              <h3>Join a braid</h3>
              <p>Let us match you with others.</p>
              <button
                className="btn btn-secondary"
                onClick={joinQueue}
                disabled={joiningQueue}
              >
                {joiningQueue ? 'Joining...' : 'Match me to one'}
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
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {trinity && isComplete && (
        <div className="trinity-complete">
          <h2>YOUR BRAID IS FORMED</h2>
          <p className="subtitle">This is your support team for on-the-J.O.B. training</p>

          <div className="trinity-members">
            {members.map((m, i) => (
              <div key={i} className="trinity-member-card trinity-member-active">
                <div className="trinity-member-name">
                  {m.members?.name || 'Unnamed'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {trinity && (
        <>
          <div className="practice-section">
            <h3>What is a Braid?</h3>
            <p>
              It&apos;s a tool for being human. Use it to integrate:
            </p>
            <ul className="braid-list">
              <li>life events</li>
              <li>work challenges</li>
              <li>emotional challenges</li>
              <li>relationship challenges</li>
              <li>health challenges</li>
              <li>creative inspiration</li>
            </ul>
            <p>
              Instead of getting stuck in unconscious drama, you can use the support of your
              braid to shift into conscious creation in real time.
            </p>
            <p>This practice will help teach you how to:</p>
            <ul className="braid-list">
              <li>witness without rescuing</li>
              <li>challenge without shaming</li>
              <li>create without overthinking</li>
              <li>relate without performing</li>
            </ul>
            <p>Braids are how humans practice becoming more conscious together.</p>
          </div>

          <div className="practice-section">
            <h3>A simple practice:</h3>
            <ol className="practice-moves">
              <li><strong>Someone shares</strong> &mdash; what&apos;s happening / what are they needing?</li>
              <li><strong>Others witness</strong> &mdash; reflecting back what they heard, without solving the problem</li>
              <li>
                <strong>Try on different roles</strong> &mdash;
                <br /><em>Coach: </em> I&apos;m with you
                <br /><em>Challenger: </em> You can face this
                <br /><em>Creator: </em> Let&apos;s create something new
              </li>
              <li><strong>Reflection</strong> &mdash; What landed? What will you do?</li>
              <li><strong>Integration</strong> &mdash; Later check in. What&apos;s changed / shifted?</li>
            </ol>
          </div>

          <div className="practice-section">
            <h3>Why 3?</h3>
            <p>Everything stabilizes and transforms through three:</p>
            <ul className="braid-list">
              <li>Triangle = strongest structure</li>
              <li>Trinity = wholeness</li>
              <li>Delta (&Delta;) = change</li>
            </ul>
            <p>Humans unconsciously default to the Drama Triangle:</p>
            <ul className="braid-list">
              <li>Victim</li>
              <li>Persecutor</li>
              <li>Rescuer</li>
            </ul>
            <p>
              Braids help humans consciously shift into the Empowerment Triangle of
              coach, challenger, and creator.
            </p>
            <p>
              They&apos;ll also provide a container for new tools and practices we introduce
              through your on-the-J.O.B. training.
            </p>
          </div>

          <div className="practice-section">
            <h3>The Marco Polo Method</h3>
            <p>
              Braids can happen anywhere. Text, Zoom, IRL. Totally up to you. But we
              strongly recommend the Marco Polo method.
            </p>
            <p>
              Marco Polo is a free app that offers async communication through video
              (kind of like a video walkie talkie). It doesn&apos;t require a scheduled time,
              allows for honest expression, and deep listening.
            </p>
            <p>
              Once you get connected to your braid, when and how you communicate is
              totally up to you.
            </p>
          </div>

          <div className="practice-section">
            <h3>Final notes:</h3>
            <ul className="braid-list">
              <li>You can have multiple braids</li>
              <li>You can move in and out of braids</li>
              <li>Braids can last as long as you want and can also end at any time</li>
              <li>If you need anything different from your braid, practice clear communication and Authentic Relating</li>
            </ul>
          </div>

          <div className="whats-next">
            <h3>What&apos;s Next?</h3>
            <p>You&apos;ll have to watch the Sunday Night Live to see.</p>
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
                    className="btn btn-gold"
                    style={{ marginTop: '0.75rem', display: 'inline-flex' }}
                  >
                    Watch live or replay
                  </a>
                )}
              </div>
            )}
            {upcoming.length === 0 && (
              <a
                href="#"
                className="btn btn-gold"
                style={{ marginTop: '0.75rem', display: 'inline-flex', opacity: 0.5, pointerEvents: 'none' }}
              >
                Watch live or replay &mdash; coming soon
              </a>
            )}
          </div>
        </>
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
