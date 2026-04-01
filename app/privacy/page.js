export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <h1>Privacy Policy</h1>
      <p className="legal-effective">Effective: March 29, 2026</p>

      <section>
        <h2>Who we are</h2>
        <p>
          J.O.B. (&ldquo;The Joy of Being&rdquo;) operates the website at itsthejob.com
          and its subdomains. This policy explains how we collect, use, and protect
          your information.
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li><strong>Account information:</strong> Name, email address, and phone number (optional) when you become a member.</li>
          <li><strong>Authentication data:</strong> We use Google Sign-In and magic links via Supabase. We do not store passwords.</li>
          <li><strong>Usage data:</strong> Basic analytics about how you interact with the site (pages visited, features used).</li>
          <li><strong>Content you provide:</strong> Video responses, braid activity, and any other content you submit through the platform.</li>
        </ul>
      </section>

      <section>
        <h2>How we use your information</h2>
        <ul>
          <li>To create and manage your membership account.</li>
          <li>To facilitate braids and community features.</li>
          <li>To send you important updates about your membership and gatherings.</li>
          <li>To improve the platform and member experience.</li>
        </ul>
      </section>

      <section>
        <h2>Third-party services</h2>
        <p>We use the following third-party services:</p>
        <ul>
          <li><strong>Supabase:</strong> Authentication and database hosting.</li>
          <li><strong>Google:</strong> OAuth sign-in.</li>
          <li><strong>Vercel:</strong> Website hosting.</li>
          <li><strong>VideoAsk:</strong> Video introductions.</li>
          <li><strong>Resend:</strong> Transactional email.</li>
        </ul>
        <p>Each service has its own privacy policy governing how they handle your data.</p>
      </section>

      <section>
        <h2>Data retention</h2>
        <p>
          We retain your account data for as long as your membership is active.
          You can request deletion of your account and associated data at any time
          by contacting us.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your data.</li>
          <li>Withdraw consent at any time.</li>
        </ul>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          For privacy-related questions or requests, reach out to us at the
          contact information provided on our website.
        </p>
      </section>
    </div>
  );
}
