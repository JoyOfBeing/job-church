'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../components/AuthProvider';

export default function ConversationPage() {
  const { user, loading, supabase } = useAuth();
  const router = useRouter();
  const { id: partnerId } = useParams();
  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchConversation();
  }, [user, loading, partnerId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchConversation() {
    const [partnerRes, messagesRes] = await Promise.all([
      supabase
        .from('members')
        .select('id, name, photo_url')
        .eq('id', partnerId)
        .single(),
      supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true }),
    ]);

    if (partnerRes.data) setPartner(partnerRes.data);
    if (messagesRes.data) setMessages(messagesRes.data);
    setLoadingData(false);

    // Mark unread messages as read
    if (messagesRes.data) {
      const unreadIds = messagesRes.data
        .filter(m => m.recipient_id === user.id && !m.read_at)
        .map(m => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', unreadIds);
      }
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      recipient_id: partnerId,
      body: body.trim(),
    });

    if (!error) {
      setBody('');
      await fetchConversation();
    } else {
      console.error('Send error:', error);
      alert('Message failed to send.');
    }
    setSending(false);
  }

  if (loading || loadingData) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) return null;

  if (!partner) {
    return (
      <div className="messages-page">
        <h1>Member not found</h1>
        <Link href="/messages" className="btn btn-secondary">Back to Messages</Link>
      </div>
    );
  }

  return (
    <div className="conversation-page">
      <div className="conversation-top-bar">
        <Link href="/messages" className="back-link">&larr;</Link>
        <Link href={`/member/${partnerId}`} className="conversation-partner">
          {partner.photo_url ? (
            <img src={partner.photo_url} alt={partner.name} className="conversation-partner-photo" />
          ) : (
            <div className="conversation-partner-placeholder">
              {(partner.name || '?')[0].toUpperCase()}
            </div>
          )}
          <span>{partner.name || 'Unnamed'}</span>
        </Link>
      </div>

      <div className="conversation-messages">
        {messages.length === 0 && (
          <p className="conversation-empty">Start the conversation.</p>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`message-bubble ${msg.sender_id === user.id ? 'message-mine' : 'message-theirs'}`}
          >
            <p>{msg.body}</p>
            <span className="message-time">
              {new Date(msg.created_at).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="conversation-input" onSubmit={handleSend}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a message..."
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
        />
        <button type="submit" className="btn btn-gold" disabled={sending || !body.trim()}>
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
