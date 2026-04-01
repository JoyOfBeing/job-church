'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <h1>Privacy Policy</h1>
      <p className="legal-updated">Last updated: March 31, 2026</p>

      <div className="legal-content">

        <section>
          <h2>1. Who We Are</h2>
          <p>
            J.O.B. Church (&ldquo;J.O.B.,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) is a 508(c)(1)(A) church. This policy describes how we collect, use, and protect your personal information
            when you use our website, become a member, or participate in our programming.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>

          <h3>Information you provide:</h3>
          <ul>
            <li><strong>Account information:</strong> Name, email address, phone number, password</li>
            <li><strong>Donation information:</strong> Donation amounts and frequency (payment processing is handled
              by Donorbox and Stripe &mdash; we do not store your credit card numbers)</li>
            <li><strong>Profile information:</strong> Any additional information you choose to share in your profile</li>
            <li><strong>Community content:</strong> Messages, reflections, or content you share within Braids,
              tracks, or community spaces on our platform</li>
          </ul>

          <h3>Information collected automatically:</h3>
          <ul>
            <li><strong>Usage data:</strong> Pages visited, features used, time spent on site</li>
            <li><strong>Device information:</strong> Browser type, operating system, IP address</li>
            <li><strong>Cookies:</strong> Authentication cookies to keep you signed in (we do not use advertising
              or tracking cookies)</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To provide and maintain your membership and access to J.O.B. programming</li>
            <li>To process donations and provide tax receipts</li>
            <li>To facilitate Braid matching, track enrollments, and Elder session bookings</li>
            <li>To communicate with you about gatherings, programming, and community updates</li>
            <li>To improve our platform and programming</li>
            <li>To comply with legal obligations</li>
          </ul>
          <p>
            <strong>We will never sell your personal information.</strong> We will never share your information
            with third parties for marketing purposes.
          </p>
        </section>

        <section>
          <h2>4. Third-Party Services</h2>
          <p>We use the following third-party services that may process your data:</p>
          <ul>
            <li><strong>Supabase:</strong> Database and authentication (your account data)</li>
            <li><strong>Donorbox:</strong> Donation processing</li>
            <li><strong>Stripe:</strong> Payment processing (via Donorbox)</li>
            <li><strong>Vercel:</strong> Website hosting</li>
            <li><strong>Resend:</strong> Transactional email (Braid notifications, etc.)</li>
          </ul>
          <p>
            Each of these services has its own privacy policy. We select services that maintain appropriate
            security standards for handling personal data.
          </p>
        </section>

        <section>
          <h2>5. Confidentiality of Spiritual Content</h2>
          <p>
            We recognize that members share deeply personal content within J.O.B. &mdash; in Braids,
            Deprogramming tracks, Elder sessions, and community spaces. We treat this content with the
            same confidentiality as pastoral communications:
          </p>
          <ul>
            <li>Staff and Elders with access to member content are bound by confidentiality obligations</li>
            <li>We will not disclose spiritual or personal content shared within J.O.B. to third parties
              except as required by law (e.g., mandated reporting of imminent harm)</li>
            <li>Anonymized and aggregated data may be used to improve programming</li>
          </ul>
        </section>

        <section>
          <h2>6. Data Security</h2>
          <p>
            We implement reasonable technical and organizational measures to protect your personal information,
            including encryption in transit (HTTPS), secure authentication, and row-level security on our
            database. However, no system is perfectly secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2>7. Data Retention</h2>
          <ul>
            <li><strong>Active members:</strong> We retain your data for the duration of your membership</li>
            <li><strong>After termination:</strong> We retain basic records (name, email, donation history)
              for 7 years to comply with tax and legal obligations, then delete them</li>
            <li><strong>Community content:</strong> Content shared in tracks and Braids may be retained to
              maintain community continuity, but can be deleted upon request</li>
          </ul>
        </section>

        <section>
          <h2>8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access</strong> the personal information we hold about you</li>
            <li><strong>Correct</strong> inaccurate information</li>
            <li><strong>Delete</strong> your account and personal data (subject to legal retention requirements)</li>
            <li><strong>Export</strong> your data in a portable format</li>
            <li><strong>Opt out</strong> of non-essential communications at any time</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{' '}
            <a href="mailto:nkat11@gmail.com">nkat11@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2>9. Children</h2>
          <p>
            J.O.B. membership is available to individuals 18 years of age or older. We do not knowingly
            collect personal information from anyone under 18. If we learn that we have collected data
            from a minor, we will delete it promptly.
          </p>
        </section>

        <section>
          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Material changes will be communicated
            to members via email. The &ldquo;Last updated&rdquo; date at the top reflects the most recent revision.
          </p>
        </section>

        <section>
          <h2>11. Contact</h2>
          <p>
            Questions about your privacy? Reach us at{' '}
            <a href="mailto:nkat11@gmail.com">nkat11@gmail.com</a>.
          </p>
        </section>

      </div>

      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <Link href="/doctrine" className="btn btn-secondary">Back to Doctrine</Link>
      </div>
    </div>
  );
}
