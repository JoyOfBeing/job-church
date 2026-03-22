'use client';

import { useState } from 'react';
import { createClient } from '../lib/supabase';

const QUESTIONS = [
  'Who are you?',
  'What do you want?',
  'What needs to die?',
  'Who are you becoming?',
  'How do we integrate that?',
];

const ELDER_STORIES = [
  'Your first elder walks with you into the question you\'ve been avoiding. They\'ve sat with their own answer long enough to hold space for yours.',
  'This elder knows desire — the real kind, not the curated kind. They\'ll help you untangle what you actually want from what you think you should.',
  'The elder of the third threshold has lost something that mattered. They know what it costs to let go, and they won\'t rush you through it.',
  'This elder is mid-becoming themselves. They don\'t have it figured out. That\'s the point. Becoming isn\'t a destination.',
  'The final elder has walked all five thresholds and circled back. Integration is not an ending. It\'s a practice.',
];

export default function Threshold({ progress, onSave }) {
  const [declaration, setDeclaration] = useState(progress.declaration || '');
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const num = progress.threshold_number;
  const status = progress.status;
  const question = QUESTIONS[num - 1];
  const elderStory = ELDER_STORIES[num - 1];

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from('journey_progress')
      .update({ declaration })
      .eq('id', progress.id);

    if (!error && onSave) {
      onSave({ ...progress, declaration });
    }
    setSaving(false);
  }

  const statusClass = `threshold threshold-${status}`;

  return (
    <div className={statusClass}>
      <div className="threshold-header">
        <div className="threshold-number">{num}</div>
        <div className="threshold-question">{question}</div>
        <div className="threshold-status">
          {status === 'locked' && 'Locked'}
          {status === 'active' && 'Active'}
          {status === 'completed' && 'Complete'}
        </div>
      </div>

      {status === 'active' && (
        <div className="threshold-body">
          <div className="elder-intro">
            <h4>Your Elder</h4>
            <p>{elderStory}</p>
          </div>

          <p className="declaration-label">Your declaration:</p>
          <textarea
            value={declaration}
            onChange={(e) => setDeclaration(e.target.value)}
            placeholder="Write what comes up for you..."
          />
          <div className="declaration-actions">
            <button
              className="btn btn-gold btn-sm"
              onClick={handleSave}
              disabled={saving || !declaration.trim()}
            >
              {saving ? 'Saving...' : 'Save declaration'}
            </button>
          </div>
        </div>
      )}

      {status === 'completed' && progress.declaration && (
        <div className="threshold-body">
          <p className="declaration-label">Your declaration:</p>
          <div className="declaration-saved">{progress.declaration}</div>
        </div>
      )}
    </div>
  );
}
