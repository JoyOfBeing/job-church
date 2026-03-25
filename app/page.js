import Link from 'next/link';

export default function Home() {
  return (
    <div className="landing">
      <h1>The Joy of Being</h1>

      <div className="landing-intro">
        <p>
          JOB is a church. Not the kind you grew up with. Not the kind that tells you
          what to believe. The kind that asks you to show up — fully, honestly, as
          yourself — and do the work of being human.
        </p>
        <p>
          We believe being human is the job. Not your career. Not your productivity.
          The actual, sacred, sometimes brutal work of becoming who you are.
        </p>
      </div>

      <div className="video-placeholder">
        Video coming soon
      </div>

      <div className="landing-section">
        <h2>What is JOB?</h2>
        <p>
          JOB is a spiritual community structured as a church. No sermons. No dogma.
          Just six truths and a commitment to showing up for your own life.
        </p>
      </div>

      <div className="landing-section">
        <h2>The Holy Trinity</h2>
        <p>
          Your first practice as a member of JOB: form a Trinity. Three people who
          practice being honest with each other. Not a support group. Not therapy.
          A practice field for becoming more conscious — together.
        </p>
        <p>
          Three roles, woven together: the Coach (awareness), the Challenger (truth),
          and the Creator (action). You move between all three. That&apos;s the braid.
        </p>
      </div>

      <div className="landing-section">
        <h2>The Holding Company</h2>
        <p>
          JOB is also a holding company. The church holds the company. Not the other
          way around. Values come first — profit serves purpose, not the reverse.
        </p>
      </div>

      <Link href="/doctrine" className="cta-link">
        Read the doctrine
      </Link>
    </div>
  );
}
