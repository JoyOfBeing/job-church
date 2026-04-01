import { Resend } from 'resend';
import { createClient } from '../../../lib/supabase-server';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(request) {
  try {
    if (!resend) {
      return Response.json({ error: 'Email not configured' }, { status: 503 });
    }

    // Verify the user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { members, braidId } = await request.json();

    // Validate input shape
    if (!braidId || !Array.isArray(members) || members.length === 0 || members.length > 3) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Verify the braid exists and the requesting user is a member
    const { data: membership } = await supabase
      .from('trinity_members')
      .select('id')
      .eq('trinity_id', braidId)
      .eq('member_id', user.id)
      .single();

    if (!membership) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const emails = members
      .filter(m => m.email && typeof m.email === 'string')
      .map(m => ({
        from: 'J.O.B. <onboarding@resend.dev>',
        replyTo: 'theonlyhumanjobleft@gmail.com',
        to: m.email,
        subject: 'Your braid has been formed!',
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; background: #0a0a0a; color: #e8e8e8;">
            <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Your braid is ready, ${escapeHtml(m.name || 'friend')}.</h1>
            <p style="color: #e8e8e8; line-height: 1.7;">
              Three humans. One practice. Your braid has been formed and your partners are waiting.
            </p>
            <p style="color: #e8e8e8; line-height: 1.7;">
              Sign in to see who you've been matched with and what to do next.
            </p>
            <a href="https://job-church.vercel.app/login" style="display: inline-block; margin-top: 1rem; padding: 0.7rem 1.5rem; background: #c9a84c; color: #0a0a0a; font-weight: 700; text-decoration: none; border-radius: 8px;">
              Go to your braid
            </a>
            <p style="color: #888; font-size: 0.85rem; margin-top: 2rem;">
              — The Joy of Being
            </p>
          </div>
        `,
      }));

    const results = await Promise.all(
      emails.map(email => resend.emails.send(email))
    );

    return Response.json({ sent: results.length });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
