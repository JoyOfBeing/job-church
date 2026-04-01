import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-links">
        <Link href="/privacy">Privacy Policy</Link>
        <span className="footer-divider">&middot;</span>
        <Link href="/terms">Terms of Service</Link>
      </div>
    </footer>
  );
}
