import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Llave administrativa
);

async function createUser() {
  const [email, password] = process.argv.slice(2);
  
  if (!email || !password) {
    console.error('Uso: npx tsx src/scripts/create-user.ts <email> <password>');
    return;
  }

  console.log(`Intentando crear usuario: ${email}...`);

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('apiKey')) {
      console.error('CONSEJO: Asegúrate de haber agregado SUPABASE_SERVICE_ROLE_KEY a tu .env.local');
    }
  } else {
    console.log('✅ Usuario creado con éxito:', data.user?.email);
  }
}

createUser();
