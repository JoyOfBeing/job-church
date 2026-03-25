import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { members, braidId } = await request.json();

    const emails = members
      .filter(m => m.email)
      .map(m => ({
        from: 'J.O.B. <onboarding@resend.dev>',
        replyTo: 'theonlyhumanjobleft@gmail.com',
        to: m.email,
        subject: 'Your braid has been formed!',
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; background: #0a0a0a; color: #e8e8e8;">
            <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Your braid is ready, ${m.name || 'friend'}.</h1>
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
    return Response.json({ error: error.message }, { status: 500 });
  }
}
