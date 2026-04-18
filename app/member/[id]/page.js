'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../components/AuthProvider';

export default function MemberProfilePage() {
  const { user, member: currentMember, loading, supabase } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  const isOwnProfile = user?.id === id;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [user, loading, id]);

  async function fetchProfile() {
    const [profileRes, postsRes] = await Promise.all([
      supabase
        .from('members')
        .select('id, name, email, pronouns, location, bio, photo_url, is_elder, joined_at')
        .eq('id', id)
        .single(),
      supabase
        .from('bulletin_posts')
        .select('id, type, title, created_at')
        .eq('author_id', id)
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data);
      setEditData({
        name: profileRes.data.name || '',
        pronouns: profileRes.data.pronouns || '',
        location: profileRes.data.location || '',
        bio: profileRes.data.bio || '',
        photo_url: profileRes.data.photo_url || '',
      });
    }
    if (postsRes.data) setPosts(postsRes.data);
    setLoadingData(false);
  }

  async function handleSave() {
    setSaving(true);

    const { error } = await supabase
      .from('members')
      .update({
        name: editData.name || null,
        pronouns: editData.pronouns || null,
        location: editData.location || null,
        bio: editData.bio || null,
        photo_url: editData.photo_url || null,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Profile save error:', error);
      alert('Could not save — check console for details.');
    } else {
      setEditing(false);
      await fetchProfile();
    }
    setSaving(false);
  }

  if (loading || loadingData) {
    return <div className="loading">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <h1>Member not found</h1>
        <Link href="/bulletin" className="btn btn-secondary">Back to Bulletin</Link>
      </div>
    );
  }

  const joinDate = new Date(profile.joined_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="profile-page">
      <Link href="/bulletin" className="back-link">&larr; Bulletin</Link>

      <div className="profile-header">
        <div className="profile-photo">
          {profile.photo_url ? (
            <img src={profile.photo_url} alt={profile.name || 'Member'} />
          ) : (
            <div className="profile-photo-placeholder">
              {(profile.name || '?')[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="profile-info">
          <h1>
            {profile.name || 'Unnamed'}
            {profile.pronouns && (
              <span className="profile-pronouns"> ({profile.pronouns})</span>
            )}
          </h1>
          {profile.is_elder && (
            <span className="elder-badge">Elder</span>
          )}
          {profile.location && (
            <p className="profile-location">{profile.location}</p>
          )}
          <p className="profile-joined">Member since {joinDate}</p>
        </div>
      </div>

      {editing ? (
        <div className="profile-edit-form">
          <div className="field">
            <label>Name</label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Pronouns</label>
            <input
              type="text"
              value={editData.pronouns}
              onChange={(e) => setEditData({ ...editData, pronouns: e.target.value })}
              placeholder="e.g. she/her, they/them"
            />
          </div>
          <div className="field">
            <label>Location</label>
            <input
              type="text"
              value={editData.location}
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              placeholder="e.g. Austin, TX"
            />
          </div>
          <div className="field">
            <label>Photo URL</label>
            <input
              type="text"
              value={editData.photo_url}
              onChange={(e) => setEditData({ ...editData, photo_url: e.target.value })}
              placeholder="Paste a link to your photo"
            />
          </div>
          <div className="field">
            <label>Bio</label>
            <textarea
              value={editData.bio}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              placeholder="What's your Joy of Being?"
              rows={4}
            />
          </div>
          <div className="profile-edit-actions">
            <button className="btn btn-gold" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button className="btn btn-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {profile.bio && (
            <div className="profile-bio">
              <p>{profile.bio}</p>
            </div>
          )}

          {isOwnProfile && (
            <button
              className="btn btn-secondary"
              onClick={() => setEditing(true)}
              style={{ marginTop: '1rem' }}
            >
              Edit Profile
            </button>
          )}
        </>
      )}

      {posts.length > 0 && (
        <div className="profile-activity">
          <h2>Bulletin Activity</h2>
          {posts.map(post => (
            <Link href="/bulletin" key={post.id} className="profile-post-card">
              <span className="profile-post-type">{post.type}</span>
              <span className="profile-post-title">{post.title}</span>
              <span className="profile-post-date">
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </Link>
          ))}
        </div>
      )}

      {posts.length === 0 && !isOwnProfile && (
        <p className="profile-no-activity">No bulletin posts yet.</p>
      )}
    </div>
  );
}
