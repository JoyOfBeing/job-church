'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../components/AuthProvider';
import { FLAGS } from '../../../lib/flags';

export default function ElderProfilePage() {
  const { user, member, loading, supabase } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [elder, setElder] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Booking form state
  const [bookingDate, setBookingDate] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (!member?.is_committed) { router.push('/offering'); return; }
    fetchElder();
  }, [user, member, loading, id]);

  async function fetchElder() {
    const { data: elderData } = await supabase
      .from('elders')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (elderData) {
      setElder(elderData);

      // Fetch elder's tracks
      const { data: tracksData } = await supabase
        .from('tracks')
        .select('*')
        .eq('elder_id', elderData.id)
        .eq('is_published', true);

      if (tracksData) setTracks(tracksData);
    }
    setLoadingData(false);
  }

  async function handleBookSession(e) {
    e.preventDefault();
    setBooking(true);

    const { error } = await supabase.from('elder_sessions').insert({
      elder_id: elder.id,
      member_id: user.id,
      scheduled_at: new Date(bookingDate).toISOString(),
      amount_cents: elder.hourly_rate_cents || 0,
      platform_fee_cents: Math.round((elder.hourly_rate_cents || 0) * 0.2),
      status: 'pending',
      notes: bookingNotes || null,
    });

    if (!error) {
      setBookingSuccess(true);
      setBookingDate('');
      setBookingNotes('');
    }
    setBooking(false);
  }

  if (!FLAGS.ELDERS_ENABLED) {
    return (
      <div className="elders-page">
        <div className="coming-soon-block">
          <h1>Coming soon.</h1>
          <Link href="/snl" className="btn btn-secondary">Back to SNL</Link>
        </div>
      </div>
    );
  }

  if (loading || loadingData) return <div className="loading">Loading...</div>;

  if (!elder) {
    return (
      <div className="elders-page">
        <h1>Elder not found</h1>
        <Link href="/elders" className="btn btn-secondary">Back to elders</Link>
      </div>
    );
  }

  return (
    <div className="elder-profile-page">
      <Link href="/elders" className="back-link">&larr; All elders</Link>

      <div className="elder-profile-header">
        {elder.photo_url && (
          <div className="elder-profile-photo">
            <img src={elder.photo_url} alt={elder.name} />
          </div>
        )}
        <div>
          <h1>{elder.name}</h1>
          {elder.specialties?.length > 0 && (
            <div className="elder-specialties">
              {elder.specialties.map((s, i) => (
                <span key={i} className="elder-specialty-tag">{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {elder.bio && <p className="elder-full-bio">{elder.bio}</p>}

      {tracks.length > 0 && (
        <div className="elder-tracks-section">
          <h2>Tracks</h2>
          {tracks.map(t => (
            <Link href={`/deprogramming/${t.slug}`} key={t.id} className="track-card">
              <h3>{t.title}</h3>
              <p>{t.description}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="elder-booking-section">
        <h2>Book a 1:1 Session</h2>
        {elder.hourly_rate_cents && (
          <p className="section-desc">
            ${elder.hourly_rate_cents / 100} per session (sliding scale — pay what feels right)
          </p>
        )}

        {bookingSuccess ? (
          <div className="success-msg">
            Session request sent. The elder will confirm your booking.
          </div>
        ) : (
          <form onSubmit={handleBookSession}>
            <div className="field">
              <label>Preferred date &amp; time</label>
              <input
                type="datetime-local"
                value={bookingDate}
                onChange={e => setBookingDate(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Notes (optional)</label>
              <textarea
                value={bookingNotes}
                onChange={e => setBookingNotes(e.target.value)}
                placeholder="What would you like to work on?"
                rows={3}
              />
            </div>
            <button type="submit" className="btn btn-gold" disabled={booking}>
              {booking ? 'Booking...' : 'Request session'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
