'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../components/AuthProvider';
import JourneyProgress from '../../components/JourneyProgress';
import { FLAGS } from '../../lib/flags';

function DonationSection() {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://donorbox.org/widgets.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      try { document.head.removeChild(script); } catch {}
    };
  }, []);

  return (
    <div className="membership-section membership-donation">
      <h2>The Offering</h2>
      <p className="membership-desc">
        Pay what feels honest. This sustains the organism — the elders, the tracks,
        the infrastructure of transformation.
      </p>

      <div className="donorbox-embed">
        <dbox-widget
          campaign="j-o-b-church-membership-922189"
          type="donation_form"
          enable-auto-scroll="true"
        ></dbox-widget>
      </div>

      <p className="donation-note">
        After your donation, you&apos;ll be redirected back here and Deprogramming will unlock.
      </p>
    </div>
  );
}

export default function MembershipPage() {
  const { user, member, loading, fetchMember } = useAuth();
  const router = useRouter();
  const [committed, setCommitted] = useState(false);
  const [showDonation, setShowDonation] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, loading]);

  // Check if coming back from successful donation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('confirmed') === 'true' && user) {
      fetchMember(user.id);
    }
  }, [user]);

  if (!FLAGS.MEMBERSHIP_ENABLED) {
    return (
      <div className="membership-page">
        <JourneyProgress completedSteps={[1, 2, 3, 4]} />
        <div className="coming-soon-block">
          <h1>Something is being built.</h1>
          <p className="subtitle">This threshold isn&apos;t ready yet. But it will be.</p>
          <Link href="/snl" className="btn btn-secondary">Back to SNL</Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return null;

  if (member?.is_committed) {
    return (
      <div className="membership-page">
        <JourneyProgress completedSteps={[1, 2, 3, 4]} />
        <div className="membership-confirmed">
          <div className="membership-confirmed-icon">&#10003;</div>
          <h1>You&apos;re in.</h1>
          <p className="subtitle">You chose this. Now the real work begins.</p>
          <Link href="/deprogramming" className="btn btn-gold">Begin Deprogramming</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="membership-page">
      <JourneyProgress completedSteps={[1, 2, 3, 4]} />

      <h1>The Membership Threshold</h1>
      <p className="membership-intro">
        You&apos;ve tasted J.O.B. You&apos;ve sat with the beliefs. You&apos;ve crossed the
        first threshold. You&apos;ve been braided. You&apos;ve shown up on Sunday night.
      </p>
      <p className="membership-intro">
        Now you choose it.
      </p>

      <div className="membership-section">
        <h2>What Unlocks</h2>
        <p className="membership-desc">
          Deprogramming. Six modules of unlearning everything that made you perform instead of live.
        </p>
        <div className="membership-preview">
          <div className="membership-preview-item">Trauma-Informed Presence</div>
          <div className="membership-preview-item">Boundaries as Sacred Architecture</div>
          <div className="membership-preview-item">The Binary Detox</div>
          <div className="membership-preview-item">Grief Work</div>
          <div className="membership-preview-item">Play &amp; Embodiment</div>
          <div className="membership-preview-item">The Offer</div>
        </div>
        <p className="membership-desc" style={{ marginTop: '1rem' }}>
          This is the work before the work. When you finish, you&apos;ll know what&apos;s yours to give — and
          the JOB Board opens.
        </p>
      </div>

      <div className="membership-section">
        <h2>The Commitment</h2>
        <p className="membership-desc">
          This is not a paywall. It&apos;s a declaration. You&apos;re saying: <em>I&apos;m not just
          watching anymore. I&apos;m in this.</em>
        </p>

        <label className="commitment-item membership-commitment">
          <input
            type="checkbox"
            checked={committed}
            onChange={(e) => {
              setCommitted(e.target.checked);
              if (e.target.checked) setShowDonation(true);
            }}
          />
          <span>
            <strong>I AM.</strong> I choose to commit to J.O.B. — to the work of being human,
            to my braid, to this community. I understand that what comes next will ask more of me.
          </span>
        </label>
      </div>

      {showDonation && <DonationSection />}
    </div>
  );
}
