'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../components/AuthProvider';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const choirRef = useRef(null);
  const playedRef = useRef(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/bulletin');
    }
  }, [user, loading]);

  function playChoir() {
    if (playedRef.current) return;
    playedRef.current = true;
    if (!choirRef.current) {
      choirRef.current = new Audio('/choir.m4a');
      choirRef.current.volume = 0.6;
    }
    choirRef.current.currentTime = 0;
    choirRef.current.play().catch(() => {});
  }

  return (
    <div className="landing">
      <div className="landing-hero">
        <h1 className="landing-headline">
          A church for people<br />who&apos;d never join one (again/ever)
        </h1>
        <p className="landing-tagline"></p>
      </div>


      <div className="landing-intro">
        <p>
          Maybe you lost the job, the faith, or the plot. Possibly all three.
        </p>
        <p>
          J.O.B. is not here to save you. You don&apos;t need saving.
          You need people who&apos;ve done their own inner work and can help point
          you back to yourself. You need a place that holds grief and desire in
          the same room. You need permission to stop performing and start being.
          You need permission to play.
        </p>
        <p>
          This is the only church with no answers &mdash; only questions.
          We don&apos;t point you to a book, a prophet, or a middleman.
          Your access to the divine is through yourself.
        </p>
        <p>
          J.O.B. is here to be the liminal space between who you are and who
          you&apos;re becoming.
        </p>
        <p className="landing-pullquote">
          The joy of being. Fully alive. Fully yourself.<br />That&apos;s your sacred work.
        </p>
      </div>

      <div className="landing-reveal">
        <p className="landing-reveal-label">Welcome to</p>
        <h2 className="landing-reveal-name">J.O.B.</h2>
        <p className="landing-reveal-sub">The Joy of Being</p>
      </div>

      <div className="landing-cta-group">
        <Link
          href="/doctrine"
          className="cta-link"
          onMouseEnter={playChoir}
        >
          Read our Beliefs
        </Link>
        <p className="returning-member">
          Already a member? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
