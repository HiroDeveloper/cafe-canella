const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ddnvnlbvkqlslgjlceky.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbnZubGJ2a3Fsc2xnamxjZWt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk1MDI2MywiZXhwIjoyMDkzNTI2MjYzfQ.liPxtpR_D8VXC0Rp17eapgYHmo_hG_69Vhz3wL9rSSE';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@cafecanella.com',
    password: 'CafeCanellaAdmin2024!',
    email_confirm: true
  });

  if (error) {
    console.error('Error creating user:', error.message);
  } else {
    console.log('User created successfully:', data.user.email);
  }
}

createUser();
