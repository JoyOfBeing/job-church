'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../components/AuthProvider';

export default function MessagesPage() {
  const { user, loading, supabase } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchConversations();
  }, [user, loading]);

  async function fetchConversations() {
    // Get all messages involving this user
    const { data } = await supabase
      .from('messages')
      .select('id, sender_id, recipient_id, body, read_at, created_at')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!data) {
      setLoadingData(false);
      return;
    }

    // Group by conversation partner
    const convMap = {};
    data.forEach(msg => {
      const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
      if (!convMap[partnerId]) {
        convMap[partnerId] = {
          partnerId,
          lastMessage: msg,
          unread: 0,
        };
      }
      if (msg.recipient_id === user.id && !msg.read_at) {
        convMap[partnerId].unread++;
      }
    });

    // Fetch partner names and photos
    const partnerIds = Object.keys(convMap);
    if (partnerIds.length > 0) {
      const { data: members } = await supabase
        .from('members')
        .select('id, name, photo_url')
        .in('id', partnerIds);

      if (members) {
        members.forEach(m => {
          if (convMap[m.id]) {
            convMap[m.id].name = m.name || 'Unnamed';
            convMap[m.id].photo_url = m.photo_url;
          }
        });
      }
    }

    // Sort by most recent message
    const sorted = Object.values(convMap).sort(
      (a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)
    );

    setConversations(sorted);
    setLoadingData(false);
  }

  if (loading || loadingData) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="messages-page">
      <Link href="/bulletin" className="back-link">&larr; Bulletin</Link>
      <h1>Messages</h1>

      {conversations.length === 0 ? (
        <div className="messages-empty">
          <p>No messages yet. Visit a member&apos;s profile to start a conversation.</p>
        </div>
      ) : (
        <div className="conversation-list">
          {conversations.map(conv => (
            <Link
              key={conv.partnerId}
              href={`/messages/${conv.partnerId}`}
              className={`conversation-card ${conv.unread > 0 ? 'conversation-unread' : ''}`}
            >
              <div className="conversation-avatar">
                {conv.photo_url ? (
                  <img src={conv.photo_url} alt={conv.name} />
                ) : (
                  <div className="conversation-avatar-placeholder">
                    {(conv.name || '?')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="conversation-preview">
                <div className="conversation-header">
                  <span className="conversation-name">{conv.name}</span>
                  <span className="conversation-time">{getTimeAgo(conv.lastMessage.created_at)}</span>
                </div>
                <p className="conversation-snippet">
                  {conv.lastMessage.sender_id === user.id ? 'You: ' : ''}
                  {conv.lastMessage.body.length > 80
                    ? conv.lastMessage.body.slice(0, 80) + '...'
                    : conv.lastMessage.body}
                </p>
              </div>
              {conv.unread > 0 && (
                <span className="conversation-badge">{conv.unread}</span>
              )}
            </Link>
          ))}
        </div>
      )}
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

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
