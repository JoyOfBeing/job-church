'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const choirRef = useRef(null);
  const playedRef = useRef(false);

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
          Being human<br />is the job now
        </h1>
        <p className="landing-tagline">The rest is being automated</p>
      </div>

      <div className="landing-badge">
        <Image
          src="/job-badge.png"
          alt="J.O.B. employee badge"
          width={1280}
          height={960}
          priority
          style={{ width: '100%', maxWidth: '560px', height: 'auto' }}
        />
      </div>

      <div className="landing-intro">
        <p>
          Work never taught us how to be human. At best, it fragmented us. At worst,
          it punished us for expressing who we really are.
        </p>
        <p>
          It prioritized our brains over our bodies. Our hands over our hearts. And,
          somewhere along the way, we forgot to care about all those parts ourselves.
          Because who was going to pay for it?
        </p>
        <p className="landing-pullquote">Now, we&apos;re all paying for it.</p>
        <p>
          And now that AI is here, millions of people will be without jobs. And the ones
          that remain will be paid to do the things only humans can do.
        </p>
        <p>
          It&apos;s easy to imagine the worst case scenario here. But we prefer the
          best case one:
        </p>
        <p className="landing-pullquote">
          That you step into your job.<br />
          The one that&apos;s always been yours.
        </p>
        <p>
          If we lost our joy back when we had jobs, let&apos;s make it our new job
          to rediscover it.
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
