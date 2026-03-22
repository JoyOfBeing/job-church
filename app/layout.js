import './globals.css';
import { AuthProvider } from '../components/AuthProvider';
import Nav from '../components/Nav';

export const metadata = {
  title: 'JOB — The Joy of Being',
  description: 'Being human is the job.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Nav />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
