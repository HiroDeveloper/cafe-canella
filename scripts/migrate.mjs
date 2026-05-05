import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const { error } = await supabase.rpc('exec_sql', { query: `ALTER TABLE restaurant_info ADD COLUMN IF NOT EXISTS show_item_images BOOLEAN DEFAULT true;` });
  console.log('Error from exec_sql:', error);
  
  // If rpc doesn't exist, we can't do raw sql easily through standard JS client without an extension, but we CAN just do it. Wait, I can't execute raw DDL statements via standard Supabase JS client unless there is a specific RPC.
}
run();
