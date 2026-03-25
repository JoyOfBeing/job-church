import Link from 'next/link';

export default function Home() {
  return (
    <div className="landing">
      <h1>Being human is the job now</h1>
      <h2 className="landing-tagline">The rest is being automated</h2>

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
        <p>Now, we&apos;re all paying for it.</p>
        <p>
          And now that AI is here, millions of people will be without jobs. And the ones
          that remain will be paid to do the things only humans can do.
        </p>
        <p>
          It&apos;s easy to imagine the worst case scenario here. But we prefer the
          best case one:
        </p>
        <p>
          That you step into your job.<br />
          The one that&apos;s always been yours.
        </p>
        <p>
          If we lost our joy back when we had jobs, let&apos;s make it our new job
          to rediscover it.
        </p>
      </div>

      <div className="video-placeholder">
        Video coming soon
      </div>

      <div className="landing-section">
        <h2>Welcome to J.O.B.</h2>
        <p>It stands for the Joy of Being.</p>
      </div>

      <Link href="/doctrine" className="cta-link">
        Read our Beliefs
      </Link>

      <p className="returning-member">
        Already a member? <Link href="/login">Sign in</Link>
      </p>
    </div>
  );
}
