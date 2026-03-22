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
          JOB is a spiritual community structured as a church. Members move through a
          five-threshold journey guided by elders — real humans who have walked the path
          and can hold space for yours.
        </p>
        <p>
          There are no sermons. No dogma. Just six truths, five thresholds, and a
          commitment to showing up for your own life.
        </p>
      </div>

      <div className="landing-section">
        <h2>The Holding Company</h2>
        <p>
          JOB is also a holding company. The church holds the company. Not the other
          way around. This means values come first — profit serves purpose, not the
          reverse. The company builds tools and services that help people do their work.
          The church makes sure that work stays honest.
        </p>
      </div>

      <div className="landing-section">
        <h2>How It Works</h2>
        <p>
          You read the doctrine. You consent to it — or you don&apos;t. If you do, you
          become a member. You&apos;re assigned an elder. You move through five thresholds,
          each one asking a harder question than the last. The app is the connective
          tissue. The transformation happens through real humans.
        </p>
      </div>

      <Link href="/doctrine" className="cta-link">
        Read the doctrine
      </Link>
    </div>
  );
}
