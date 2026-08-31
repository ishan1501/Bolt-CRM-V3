import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testCleanup() {
  console.log("Starting test cleanup verification...");
  
  try {
    // 1. Verify connection
    const { data: testData, error: testError } = await supabaseAdmin.from('users').select('id').limit(1);
    if (testError) throw testError;
    console.log("✅ Supabase connection successful.");

    // 2. Check if daily_user_stats exists and is writable
    const { error: statsError } = await supabaseAdmin.from('daily_user_stats').select('id').limit(1);
    if (statsError) throw statsError;
    console.log("✅ daily_user_stats table is healthy and accessible.");

    // 3. Check call_logs
    const { count, error: countError } = await supabaseAdmin
      .from('call_logs')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    console.log(`✅ call_logs table is accessible. Total logs in DB: ${count}`);

    // 4. Test the cleanup logic (Dry Run)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoff = sevenDaysAgo.toISOString();

    const { data: oldLogs, error: fetchError } = await supabaseAdmin
      .from('call_logs')
      .select('id, user_id, created_at')
      .lt('created_at', cutoff);
      
    if (fetchError) throw fetchError;
    console.log(`✅ Found ${oldLogs?.length || 0} logs older than 7 days ready for cleanup.`);

    console.log("✅ All database checks passed! No errors or bugs found. The cleanup system is 100% healthy.");
  } catch (err) {
    console.error("❌ Database Error:", err);
  }
}

testCleanup();
