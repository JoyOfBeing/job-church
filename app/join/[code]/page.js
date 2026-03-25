'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../components/AuthProvider';

export default function JoinPage() {
  const { code } = useParams();
  const router = useRouter();
  const { user, loading, supabase } = useAuth();
  const [status, setStatus] = useState('loading'); // loading, joining, full, error, success
  const [trinityName, setTrinityName] = useState('');

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Store invite code and redirect to doctrine to sign up
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('join_code', code);
      }
      router.push('/doctrine');
      return;
    }

    joinTrinity();
  }, [user, loading]);

  async function joinTrinity() {
    setStatus('joining');

    // Find the trinity by invite code
    const { data: trinity, error: trinityError } = await supabase
      .from('trinities')
      .select('*')
      .eq('invite_code', code)
      .single();

    if (trinityError || !trinity) {
      setStatus('error');
      return;
    }

    // Check current member count
    const { data: existingMembers } = await supabase
      .from('trinity_members')
      .select('member_id')
      .eq('trinity_id', trinity.id);

    // Already in this trinity?
    if (existingMembers?.some(m => m.member_id === user.id)) {
      router.push('/trinity');
      return;
    }

    // Trinity full?
    if (existingMembers && existingMembers.length >= 3) {
      setStatus('full');
      return;
    }

    // Join
    const { error: joinError } = await supabase
      .from('trinity_members')
      .insert({
        trinity_id: trinity.id,
        member_id: user.id,
      });

    if (joinError) {
      setStatus('error');
      return;
    }

    setStatus('success');
    setTimeout(() => router.push('/trinity'), 1500);
  }

  if (loading || status === 'loading' || status === 'joining') {
    return <div className="loading">Joining your Trinity...</div>;
  }

  if (status === 'full') {
    return (
      <div className="trinity-page">
        <h1>This Trinity is full</h1>
        <p className="subtitle">
          A Trinity holds three. This one is already complete.
        </p>
        <button className="btn btn-gold" onClick={() => router.push('/trinity')}>
          Go to your Trinity
        </button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="trinity-page">
        <h1>Link not found</h1>
        <p className="subtitle">
          This invite link doesn&apos;t exist or has expired.
        </p>
        <button className="btn btn-gold" onClick={() => router.push('/trinity')}>
          Go to your Trinity
        </button>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="trinity-page">
        <h1>You&apos;re in.</h1>
        <p className="subtitle">Redirecting to your Trinity...</p>
      </div>
    );
  }

  return null;
}
