'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../../components/AuthProvider';
import JourneyProgress from '../../components/JourneyProgress';

export default function TrinityPage() {
  const { user, member, loading, supabase } = useAuth();
  const router = useRouter();
  const [braids, setBraids] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [joiningQueue, setJoiningQueue] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchBraids();
  }, [user, loading]);

  async function fetchBraids() {
    // Find all braids this member belongs to
    const { data: myMemberships } = await supabase
      .from('trinity_members')
      .select('trinity_id')
      .eq('member_id', user.id);

    if (myMemberships && myMemberships.length > 0) {
      const braidIds = myMemberships.map(m => m.trinity_id);

      const { data: braidData } = await supabase
        .from('trinities')
        .select('*')
        .in('id', braidIds);

      const { data: allMembers } = await supabase
        .from('trinity_members')
        .select('*, members(name, email)')
        .in('trinity_id', braidIds);

      if (braidData) {
        const braidsWithMembers = braidData.map(b => ({
          ...b,
          members: allMembers ? allMembers.filter(m => m.trinity_id === b.id) : [],
        }));
        setBraids(braidsWithMembers);
      }
    }

    setLoadingData(false);
  }

  async function createTrinity() {
    setCreating(true);
    setCreateError('');

    if (!user?.id) {
      setCreateError('Not signed in. Please refresh and try again.');
      setCreating(false);
      return;
    }

    const code = crypto.randomUUID().replace(/-/g, '').substring(0, 12);
    const userId = user.id;

    try {
      // Step 1: Create the braid
      const res1 = await supabase
        .from('trinities')
        .insert({ invite_code: code, created_by: userId });

      if (res1.error) {
        setCreateError('Error creating braid: ' + res1.error.message);
        setCreating(false);
        return;
      }

      // Step 2: Fetch it back
      const res2 = await supabase
        .from('trinities')
        .select('*')
        .eq('invite_code', code)
        .single();

      if (res2.error || !res2.data) {
        setCreateError('Braid created but could not load it. Try refreshing.');
        setCreating(false);
        return;
      }

      const newTrinity = res2.data;

      // Step 3: Add yourself as a member
      const res3 = await supabase
        .from('trinity_members')
        .insert({ trinity_id: newTrinity.id, member_id: userId });

      if (res3.error) {
        setCreateError('Braid created but could not add you: ' + res3.error.message);
        setCreating(false);
        return;
      }

      // Refresh all braids
      await fetchBraids();
      setCreating(false);
    } catch (err) {
      setCreateError('Unexpected error: ' + err.message);
      setCreating(false);
    }
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
      const code = crypto.randomUUID().replace(/-/g, '').substring(0, 12);

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
        fetchBraids();
        return;
      }
    }

    setJoiningQueue(false);
    // Not enough people yet — show the queue state
    if (member) member.wants_match = true;
  }

  function copyInviteLink(code, braidId) {
    const link = `${window.location.origin}/join/${code}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(() => {
        setCopiedId(braidId);
        setTimeout(() => setCopiedId(null), 2000);
      }).catch(() => fallbackCopy(link, braidId));
    } else {
      fallbackCopy(link, braidId);
    }
  }

  function fallbackCopy(text, braidId) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    setCopiedId(braidId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading || loadingData) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) return null;

  const hasBraids = braids.length > 0;

  return (
    <div className="trinity-page">
      <JourneyProgress completedSteps={[1, 2, 3]} />

      {!hasBraids && !member?.wants_match && (
        <div className="trinity-choice">
          <h1>You can&apos;t do this alone. That&apos;s not a weakness. That&apos;s the design.</h1>

          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            <Image
              src="/braid-hero.png"
              alt="A braided figure at a desk"
              width={1280}
              height={720}
              style={{ width: '100%', height: 'auto' }}
            />
          </div>

          <p className="subtitle">
            A braid is three humans who refuse to let each other sleepwalk through life.
            Pick the two realest people you know &mdash; the ones who won&apos;t let you
            hide, who&apos;ll tell you when you&apos;re full of shit and hold you when
            you fall apart. Three people practicing honesty, in real time, on purpose.
          </p>

          <div className="practice-section">
            <h3>Step One: Marco Polo</h3>
            <p>
              Braids don&apos;t text. They talk. Marco Polo is the app &mdash; async
              video so raw it&apos;ll ruin regular messaging for you. Download it.
              Join our Sharecast. See what this looks like when people stop performing.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a
                href="https://www.marcopolo.me"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Download Marco Polo
              </a>
              <a
                href="https://onmarcopolo.com/sharecast/LCx7627imhwO"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold"
              >
                Join Sharecast
              </a>
            </div>
          </div>

          {createError && <div className="error-msg">{createError}</div>}

          <div className="braid-start-module">
            <h3>Step Two: Form a Braid</h3>
            <p>Name your people. Start the thread. The braid begins when three say yes.</p>
            <button
              className="btn btn-gold"
              onClick={createTrinity}
              disabled={creating || !user}
            >
              {creating ? 'Creating...' : 'Start a braid'}
            </button>
          </div>

          <div className="practice-section">
            <h3>Step Three: Deprogramming</h3>
            <p>
              Once your braid is locked in, you&apos;ll unlock Deprogramming &mdash;
              elder-led tracks designed to help you unlearn what was never yours
              and return to what is.
            </p>
          </div>
        </div>
      )}

      {!hasBraids && member?.wants_match && (
        <div className="trinity-waiting">
          <h2>You&apos;re in the queue</h2>
          <p className="subtitle">
            We&apos;re matching braids as people join. You&apos;ll receive an email
            when your braid is formed.
          </p>
        </div>
      )}

      {hasBraids && (
        <>
          <h1>Your Braids</h1>

          {braids.map((braid) => {
            const isComplete = braid.members.length >= 3;
            const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${braid.invite_code}`;

            return (
              <div key={braid.id} className="braid-card">
                {isComplete ? (
                  <>
                    <h3>YOUR BRAID IS COMPLETE</h3>
                    <p className="subtitle">This is your support team for on-the-J.O.B. training</p>
                  </>
                ) : (
                  <>
                    <h3>Your braid is forming</h3>
                    <p className="subtitle">{braid.members.length} of 3 members</p>
                  </>
                )}

                <div className="trinity-members">
                  {braid.members.map((m, i) => (
                    <div key={i} className={`trinity-member-card ${isComplete ? 'trinity-member-active' : ''}`}>
                      <div className="trinity-member-name">
                        {m.members?.name || 'Unnamed'}
                      </div>
                    </div>
                  ))}
                  {!isComplete && Array.from({ length: 3 - braid.members.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="trinity-member-card trinity-member-empty">
                      <div className="trinity-member-name">Waiting...</div>
                    </div>
                  ))}
                </div>

                {!isComplete && (
                  <div className="invite-section">
                    <p className="invite-label">Share this link with your people:</p>
                    <div className="invite-link-row">
                      <input
                        type="text"
                        value={inviteLink}
                        readOnly
                        className="invite-input"
                      />
                      <button className="btn btn-gold btn-sm" onClick={() => copyInviteLink(braid.invite_code, braid.id)}>
                        {copiedId === braid.id ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {createError && <div className="error-msg">{createError}</div>}

          <div className="practice-section">
            <button
              className="btn btn-secondary"
              onClick={createTrinity}
              disabled={creating || !user}
            >
              {creating ? 'Creating...' : 'Start another braid'}
            </button>
          </div>

          <div className="practice-section">
            <h3>Step One: Marco Polo</h3>
            <p>
              Braids don&apos;t text. They talk. Marco Polo is the app &mdash; async
              video so raw it&apos;ll ruin regular messaging for you. Download it.
              Join our Sharecast. See what this looks like when people stop performing.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a
                href="https://www.marcopolo.me"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Download Marco Polo
              </a>
              <a
                href="https://onmarcopolo.com/sharecast/LCx7627imhwO"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold"
              >
                Join Sharecast
              </a>
            </div>
          </div>

          <div className="practice-section">
            <h3>Step Two: Deprogramming</h3>
            <p>
              Once your braid is locked in, you&apos;ll unlock Deprogramming &mdash;
              elder-led tracks designed to help you unlearn what was never yours
              and return to what is.
            </p>
            <button
              className="btn btn-gold"
              onClick={() => router.push('/deprogramming')}
              style={{ marginTop: '0.75rem' }}
            >
              Deprogramming
            </button>
          </div>
        </>
      )}
    </div>
  );
}
