import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const start = Date.now();

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { error } = await supabase.from('members').select('id', { count: 'exact', head: true });

    if (error) {
      return Response.json(
        { status: 'error', detail: 'supabase query failed', ms: Date.now() - start },
        { status: 503 }
      );
    }

    return Response.json(
      { status: 'ok', ms: Date.now() - start },
      { status: 200 }
    );
  } catch (err) {
    return Response.json(
      { status: 'error', detail: err.message, ms: Date.now() - start },
      { status: 503 }
    );
  }
}
