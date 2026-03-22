'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';

export default function AdminPage() {
  const { user, member, loading, supabase } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [journeys, setJourneys] = useState({});
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user || !member?.is_admin) {
      router.push('/');
      return;
    }

    async function fetchData() {
      const { data: memberData } = await supabase
        .from('members')
        .select('*')
        .order('joined_at', { ascending: false });

      if (memberData) setMembers(memberData);

      const { data: journeyData } = await supabase
        .from('journey_progress')
        .select('*')
        .order('threshold_number', { ascending: true });

      if (journeyData) {
        const grouped = {};
        journeyData.forEach((j) => {
          if (!grouped[j.member_id]) grouped[j.member_id] = [];
          grouped[j.member_id].push(j);
        });
        setJourneys(grouped);
      }

      setLoadingData(false);
    }

    fetchData();
  }, [user, member, loading]);

  async function advanceThreshold(memberId) {
    const memberJourney = journeys[memberId];
    if (!memberJourney) return;

    const active = memberJourney.find((j) => j.status === 'active');
    if (!active) return;

    // Complete the current threshold
    await supabase
      .from('journey_progress')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', active.id);

    // Activate the next one
    const next = memberJourney.find(
      (j) => j.threshold_number === active.threshold_number + 1
    );
    if (next) {
      await supabase
        .from('journey_progress')
        .update({ status: 'active', started_at: new Date().toISOString() })
        .eq('id', next.id);
    }

    // Refresh journey data
    const { data: refreshed } = await supabase
      .from('journey_progress')
      .select('*')
      .eq('member_id', memberId)
      .order('threshold_number', { ascending: true });

    if (refreshed) {
      setJourneys((prev) => ({ ...prev, [memberId]: refreshed }));
    }
  }

  if (loading || loadingData) {
    return <div className="loading">Loading admin...</div>;
  }

  if (!member?.is_admin) return null;

  return (
    <div className="admin">
      <h1>Admin</h1>
      <p className="subtitle">Manage members and their journeys.</p>

      <div className="admin-section">
        <h2>Members ({members.length})</h2>

        {members.map((m) => {
          const mJourney = journeys[m.id] || [];
          const activeThreshold = mJourney.find((j) => j.status === 'active');

          return (
            <div key={m.id} className="member-card">
              <div className="member-header">
                <div>
                  <div className="member-name">{m.name || 'Unnamed'}</div>
                  <div className="member-email">{m.email}</div>
                </div>
                <div className="member-meta">
                  <div>Joined {new Date(m.joined_at).toLocaleDateString()}</div>
                  {m.tithe_amount > 0 && (
                    <div>${m.tithe_amount}/mo</div>
                  )}
                </div>
              </div>

              <div className="member-journey">
                {mJourney.map((j) => (
                  <div
                    key={j.id}
                    className={`journey-dot ${
                      j.status === 'active' ? 'journey-dot-active' :
                      j.status === 'completed' ? 'journey-dot-completed' : ''
                    }`}
                    title={`Threshold ${j.threshold_number}: ${j.status}`}
                  >
                    {j.threshold_number}
                  </div>
                ))}

                {activeThreshold && (
                  <button
                    className="btn btn-gold btn-sm advance-btn"
                    onClick={() => advanceThreshold(m.id)}
                  >
                    Advance
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {members.length === 0 && (
          <p className="section-desc">No members yet.</p>
        )}
      </div>
    </div>
  );
}
