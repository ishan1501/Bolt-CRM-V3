import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow function to run for up to 60 seconds

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  // Security check: only allow cron requests (if deployed to Vercel)
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoff = sevenDaysAgo.toISOString();

    // 1. Get logs to delete
    const { data: oldLogs, error: fetchError } = await supabaseAdmin
      .from('call_logs')
      .select('id, user_id, created_at')
      .lt('created_at', cutoff);
      
    if (fetchError) throw fetchError;
      
    if (!oldLogs || oldLogs.length === 0) {
      return NextResponse.json({ message: 'No old logs found to clean up', count: 0 });
    }

    // 2. Aggregate counts by user and date
    const counts: Record<string, number> = {};
    oldLogs.forEach(log => {
      // created_at is an ISO string, split to get YYYY-MM-DD
      const date = log.created_at.split('T')[0];
      const key = `${date}_${log.user_id}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    // 3. Upsert into daily_user_stats
    for (const key of Object.keys(counts)) {
      const [date, user_id] = key.split('_');
      const count = counts[key];
      
      const { data: existing } = await supabaseAdmin
        .from('daily_user_stats')
        .select('calls_count')
        .eq('date', date)
        .eq('user_id', user_id)
        .single();
        
      if (existing) {
        await supabaseAdmin.from('daily_user_stats')
          .update({ calls_count: existing.calls_count + count })
          .eq('date', date)
          .eq('user_id', user_id);
      } else {
        await supabaseAdmin.from('daily_user_stats')
          .insert({ date, user_id, calls_count: count });
      }
    }

    // 4. Delete the raw logs in chunks to prevent timeouts
    const idsToDelete = oldLogs.map(l => l.id);
    for (let i = 0; i < idsToDelete.length; i += 1000) {
      const chunk = idsToDelete.slice(i, i + 1000);
      await supabaseAdmin.from('call_logs').delete().in('id', chunk);
    }

    // 5. Clean up stale reminders
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Delete completed reminders older than 1 day
    await supabaseAdmin
      .from('reminders')
      .delete()
      .eq('completed', true)
      .lt('date', oneDayAgo.toISOString());

    // Delete overdue reminders older than 7 days
    await supabaseAdmin
      .from('reminders')
      .delete()
      .lt('date', cutoff);

    return NextResponse.json({ 
      message: 'Cleanup successful', 
      deletedCount: idsToDelete.length 
    });
    
  } catch (err: any) {
    console.error("Cron Cleanup Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
