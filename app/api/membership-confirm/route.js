import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Uses service role key to bypass RLS — only called server-side
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// GET — redirect handler after Donorbox success
// Donorbox redirects here with donation details as query params (including donor email)
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // Donorbox sends: donor_email, amount, donation_id, etc.
  const email = searchParams.get('donor_email') || searchParams.get('email');
  const amount = searchParams.get('amount');

  if (!email) {
    return NextResponse.redirect(new URL('/membership?error=missing_email', request.url));
  }

  const supabase = getAdminClient();

  // Look up member by email
  const { data: member } = await supabase
    .from('members')
    .select('id')
    .eq('email', email)
    .single();

  if (!member) {
    // Donor email doesn't match a member — still redirect, they'll see the page
    console.error('No member found for email:', email);
    return NextResponse.redirect(new URL('/membership?confirmed=true', request.url));
  }

  const { error } = await supabase
    .from('members')
    .update({
      is_committed: true,
      committed_at: new Date().toISOString(),
      donation_amount_cents: amount ? Math.round(parseFloat(amount) * 100) : null,
      donation_frequency: 'monthly',
    })
    .eq('id', member.id);

  if (error) {
    console.error('Failed to confirm membership:', error);
    return NextResponse.redirect(new URL('/membership?error=update_failed', request.url));
  }

  return NextResponse.redirect(new URL('/membership?confirmed=true', request.url));
}

// POST — webhook handler for Donorbox (optional reliability layer)
export async function POST(request) {
  try {
    const body = await request.json();

    // Donorbox webhook payload — extract donor email
    const email = body?.donor?.email;
    if (!email) {
      return NextResponse.json({ error: 'No donor email found' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Look up member by email
    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('email', email)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Update membership status
    const { error } = await supabase
      .from('members')
      .update({
        is_committed: true,
        committed_at: new Date().toISOString(),
        donation_amount_cents: body?.amount ? Math.round(body.amount * 100) : null,
        donation_frequency: body?.recurring ? 'monthly' : 'one-time',
      })
      .eq('id', member.id);

    if (error) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
