'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import JourneyProgress from '../../components/JourneyProgress';

const POST_TYPES = [
  { value: 'offering', label: 'Offering', icon: '🤲',
    description: 'Share a gift with the community \u2014 your time, a skill, a practice. No fees, no transactions. This is generosity, not commerce.' },
  { value: 'call', label: 'Call', icon: '📣',
    description: 'Put out a call for help, collaborators, or companions. \u201CAnyone want to practice breathwork together?\u201D' },
  { value: 'ministry', label: 'Ministry', icon: '🌱',
    description: 'Propose an ongoing group around a shared interest or calling. Ministries are member-led and emerge from the community.' },
  { value: 'event', label: 'Event', icon: '📅',
    description: 'Organize a gathering \u2014 IRL meetup, virtual hangout, group activity. Free and open to members.' },
  { value: 'reflection', label: 'Reflection', icon: '🪞',
    description: 'Share something you\u2019re sitting with \u2014 a question, a realization, a provocation for the community.' },
  { value: 'announcement', label: 'Announcement', icon: '📌',
    description: 'Share church news, updates, or milestones with the community.' },
];

export default function BulletinPage() {
  const { user, member, loading, supabase } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [interests, setInterests] = useState({});
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ type: 'offering', title: '', body: '' });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!member?.is_committed) {
      router.push('/membership');
      return;
    }
    fetchPosts();
  }, [user, member, loading]);

  async function fetchPosts() {
    const { data: postData } = await supabase
      .from('bulletin_posts')
      .select('*, members(name)')
      .order('created_at', { ascending: false });

    if (postData) {
      setPosts(postData);

      // Fetch interest counts and user's own interests
      const postIds = postData.map(p => p.id);
      if (postIds.length > 0) {
        const { data: interestData } = await supabase
          .from('bulletin_interests')
          .select('post_id, member_id')
          .in('post_id', postIds);

        if (interestData) {
          const interestMap = {};
          interestData.forEach(i => {
            if (!interestMap[i.post_id]) {
              interestMap[i.post_id] = { count: 0, mine: false };
            }
            interestMap[i.post_id].count++;
            if (i.member_id === user.id) {
              interestMap[i.post_id].mine = true;
            }
          });
          setInterests(interestMap);
        }
      }
    }

    setLoadingData(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from('bulletin_posts').insert({
      author_id: user.id,
      type: formData.type,
      title: formData.title,
      body: formData.body || null,
    });

    if (!error) {
      setFormData({ type: 'offering', title: '', body: '' });
      setShowForm(false);
      await fetchPosts();
    }

    setSubmitting(false);
  }

  async function toggleInterest(postId) {
    const existing = interests[postId];

    if (existing?.mine) {
      await supabase
        .from('bulletin_interests')
        .delete()
        .eq('post_id', postId)
        .eq('member_id', user.id);
    } else {
      await supabase
        .from('bulletin_interests')
        .insert({ post_id: postId, member_id: user.id });
    }

    await fetchPosts();
  }

  if (loading || loadingData) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) return null;

  const filteredPosts = filterType === 'all'
    ? posts
    : posts.filter(p => p.type === filterType);

  const typeInfo = (type) => POST_TYPES.find(t => t.value === type) || { label: type, icon: '' };

  return (
    <div className="bulletin-page">
      <JourneyProgress completedSteps={[1, 2, 3, 4, 5, 6, 7]} />

      <h1>The Bulletin</h1>
      <p className="subtitle">What&apos;s alive in the church right now.</p>

      <div className="bulletin-rules">
        <h3>How this works</h3>
        <p>
          The Bulletin is the church&apos;s community board &mdash; a place to give,
          connect, and co-create. Everything here is offered freely as an expression
          of who you are and what you&apos;re here to contribute.
        </p>
        <ul>
          <li><strong>This is not a marketplace.</strong> No promoting paid services, no fees, no transactions. If you want to get paid for your work, that&apos;s what the <a href="https://job-board-pied-three.vercel.app" target="_blank" rel="noopener noreferrer">JOB Board</a> is for.</li>
          <li><strong>Give freely.</strong> Offerings are gifts &mdash; your time, your skill, your presence. No strings attached.</li>
          <li><strong>Be real.</strong> This is a space for honesty, not performance. Say what you mean.</li>
        </ul>
      </div>

      <div className="bulletin-actions">
        <button
          className="btn btn-gold"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Post to the Bulletin'}
        </button>
      </div>

      {showForm && (
        <form className="bulletin-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="post-type">What kind of post?</label>
            <select
              id="post-type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              {POST_TYPES.map(t => (
                <option key={t.value} value={t.value}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
            <p className="bulletin-type-hint">
              {POST_TYPES.find(t => t.value === formData.type)?.description}
            </p>
          </div>

          <div className="field">
            <label htmlFor="post-title">Title</label>
            <input
              id="post-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What are you putting out there?"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="post-body">Details (optional)</label>
            <textarea
              id="post-body"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Say more if you want to..."
              rows={4}
            />
          </div>

          <button
            type="submit"
            className="btn btn-gold"
            disabled={submitting || !formData.title.trim()}
          >
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </form>
      )}

      <div className="bulletin-filters">
        <button
          className={`bulletin-filter ${filterType === 'all' ? 'bulletin-filter-active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          All
        </button>
        {POST_TYPES.map(t => (
          <button
            key={t.value}
            className={`bulletin-filter ${filterType === t.value ? 'bulletin-filter-active' : ''}`}
            onClick={() => setFilterType(t.value)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="bulletin-empty">
          <p>Nothing here yet. Be the first to post.</p>
        </div>
      )}

      <div className="bulletin-feed">
        {filteredPosts.map(post => {
          const info = typeInfo(post.type);
          const interest = interests[post.id] || { count: 0, mine: false };
          const timeAgo = getTimeAgo(post.created_at);

          return (
            <div key={post.id} className="bulletin-post">
              <div className="bulletin-post-header">
                <span className="bulletin-post-type">{info.icon} {info.label}</span>
                <span className="bulletin-post-meta">{timeAgo}</span>
              </div>
              <h3 className="bulletin-post-title">{post.title}</h3>
              {post.body && <p className="bulletin-post-body">{post.body}</p>}
              <div className="bulletin-post-footer">
                <span className="bulletin-post-author">
                  &mdash; {post.members?.name || 'Anonymous'}
                </span>
                <button
                  className={`bulletin-interest-btn ${interest.mine ? 'bulletin-interest-active' : ''}`}
                  onClick={() => toggleInterest(post.id)}
                >
                  {interest.mine ? '✦' : '☆'} {interest.count > 0 ? interest.count : ''} {interest.count === 1 ? 'interested' : interest.count > 1 ? 'interested' : 'I\u2019m interested'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getTimeAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
