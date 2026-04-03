'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../components/AuthProvider';

export default function ElderApplyPage() {
  const { supabase } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    background: '',
    deconstruction: '',
    plantMedicine: '',
    ceremony: '',
    modalities: '',
    whyElder: '',
    availability: '',
    links: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('elder_applications')
        .insert({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          location: form.location,
          background: form.background,
          deconstruction: form.deconstruction,
          plant_medicine: form.plantMedicine,
          ceremony: form.ceremony,
          modalities: form.modalities,
          why_elder: form.whyElder,
          availability: form.availability,
          links: form.links || null,
        });

      if (insertError) {
        setError('Something went wrong. Please try again or email us directly.');
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="elder-apply-page">
        <div className="elder-apply-success">
          <h1>Received.</h1>
          <p>
            We read every one of these carefully. If there&apos;s alignment,
            we&apos;ll be in touch. Thank you for being willing to hold space.
          </p>
          <Link href="/" className="btn btn-secondary">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="elder-apply-page">
      <h1>Elders</h1>
      <p className="elder-apply-intro">
        Elders aren&apos;t hired. They&apos;re recognized. To express interest in
        guiding others, let us know who you are and why you&apos;re drawn to help
        hold the field.
      </p>
      <p className="elder-apply-intro">
        The chance to serve as an elder will be invite only. This is not an
        application &mdash; it&apos;s simply an invite to express interest in
        holding space.
      </p>

      <div className="elder-apply-what">
        <h3>Elders hold space for the real work:</h3>
        <ul>
          <li>Helping others deconstruct &mdash; religion, purity culture, hustle culture, identity, belief systems</li>
          <li>Guiding people through integration after plant medicine journeys</li>
          <li>Helping them step into their erotic power to co-create a new reality</li>
          <li>Holding space for grief, rage, confusion, and joy without rushing to resolve it</li>
          <li>Creating and holding ceremony, ritual, and sacred containers</li>
          <li>Supporting people as they rebuild after burning it all down</li>
          <li>A practice of their own &mdash; whatever that looks like</li>
          <li>Zero interest in being a guru</li>
        </ul>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleSubmit} className="elder-apply-form">
        <div className="field">
          <label>Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Your name"
            required
          />
        </div>

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="field">
          <label>Phone <span className="field-optional">(optional)</span></label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="field">
          <label>Where are you based?</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder="City, state, or 'nomadic'"
            required
          />
        </div>

        <div className="field">
          <label>Tell us about your background.</label>
          <p className="field-hint">
            What have you done, studied, practiced, survived, or been transformed
            by? No resume needed &mdash; just tell us who you are.
          </p>
          <textarea
            value={form.background}
            onChange={(e) => update('background', e.target.value)}
            rows={5}
            required
          />
        </div>

        <div className="field">
          <label>What have you deconstructed?</label>
          <p className="field-hint">
            Religion, purity culture, hustle culture, a career identity, a
            marriage, a belief system &mdash; what did you take apart and
            what did you find underneath?
          </p>
          <textarea
            value={form.deconstruction}
            onChange={(e) => update('deconstruction', e.target.value)}
            rows={5}
            required
          />
        </div>

        <div className="field">
          <label>
            Do you have experience with plant medicine?
            <span className="field-optional"> (optional &mdash; all paths honored)</span>
          </label>
          <p className="field-hint">
            Ayahuasca, psilocybin, peyote, etc. If so, how has it informed
            your practice and your ability to hold space?
          </p>
          <textarea
            value={form.plantMedicine}
            onChange={(e) => update('plantMedicine', e.target.value)}
            rows={4}
          />
        </div>

        <div className="field">
          <label>How do you relate to ceremony and ritual?</label>
          <p className="field-hint">
            Have you held ceremony? Participated in one? Created your own?
            What does sacred container mean to you?
          </p>
          <textarea
            value={form.ceremony}
            onChange={(e) => update('ceremony', e.target.value)}
            rows={4}
            required
          />
        </div>

        <div className="field">
          <label>What modalities or practices do you work with?</label>
          <p className="field-hint">
            Somatic work, breathwork, grief tending, energy work, creative
            arts, meditation, movement, coaching, therapy &mdash; anything
            that&apos;s part of how you hold space.
          </p>
          <textarea
            value={form.modalities}
            onChange={(e) => update('modalities', e.target.value)}
            rows={4}
            required
          />
        </div>

        <div className="field">
          <label>Why do you want to be an Elder at J.O.B.?</label>
          <p className="field-hint">
            What called you here? What do you want to offer? What excites
            or scares you about this?
          </p>
          <textarea
            value={form.whyElder}
            onChange={(e) => update('whyElder', e.target.value)}
            rows={5}
            required
          />
        </div>

        <div className="field">
          <label>Availability</label>
          <p className="field-hint">
            How many hours per week could you dedicate? Are you open to
            virtual, in-person, or both?
          </p>
          <textarea
            value={form.availability}
            onChange={(e) => update('availability', e.target.value)}
            rows={3}
            required
          />
        </div>

        <div className="field">
          <label>Links <span className="field-optional">(optional)</span></label>
          <p className="field-hint">
            Website, social media, portfolio, podcast, anything that
            helps us understand who you are.
          </p>
          <textarea
            value={form.links}
            onChange={(e) => update('links', e.target.value)}
            rows={2}
          />
        </div>

        <button
          type="submit"
          className="btn btn-gold btn-full"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
