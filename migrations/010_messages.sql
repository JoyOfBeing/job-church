-- Migration 010: Direct Messages
-- Run in Supabase SQL Editor

CREATE TABLE messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES members(id) NOT NULL,
  recipient_id uuid REFERENCES members(id) NOT NULL,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Members can see messages they sent or received
CREATE POLICY "Members can view own messages"
  ON messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Members can send messages
CREATE POLICY "Members can send messages"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- Recipients can mark messages as read
CREATE POLICY "Recipients can update messages"
  ON messages FOR UPDATE
  USING (recipient_id = auth.uid());

-- Create index for fast conversation lookups
CREATE INDEX idx_messages_sender ON messages(sender_id, created_at DESC);
CREATE INDEX idx_messages_recipient ON messages(recipient_id, created_at DESC);
