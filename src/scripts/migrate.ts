import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('🚀 Iniciando migración...');

  const jsonPath = path.resolve(process.cwd(), '../menu_cafe_canella.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  for (const [slug, catData] of Object.entries(data.menu)) {
    const category = catData as any;
    console.log(`\n📁 Procesando categoría: ${category.nombre}`);

    // 1. Insertar Categoría
    const { data: catRecord, error: catError } = await supabase
      .from('categories')
      .upsert({ slug, name: category.nombre }, { onConflict: 'slug' })
      .select()
      .single();

    if (catError) {
      console.error(`❌ Error al insertar categoría ${category.nombre}:`, catError.message);
      continue;
    }

    const categoryId = catRecord.id;

    // 2. Procesar Items
    for (const item of category.items) {
      const { data: itemRecord, error: itemError } = await supabase
        .from('menu_items')
        .insert({
          category_id: categoryId,
          name: item.nombre,
          description: item.descripcion || null,
        })
        .select()
        .single();

      if (itemError) {
        console.error(`  ❌ Error al insertar item ${item.nombre}:`, itemError.message);
        continue;
      }

      console.log(`  ✅ Item: ${item.nombre}`);

      // 3. Procesar Precios
      const pricesToInsert = [];
      if (item.precio) pricesToInsert.push({ item_id: itemRecord.id, label: 'Precio', price: item.precio });
      if (item.precio_sencillo) pricesToInsert.push({ item_id: itemRecord.id, label: 'sencillo', price: item.precio_sencillo });
      if (item.precio_doble) pricesToInsert.push({ item_id: itemRecord.id, label: 'doble', price: item.precio_doble });
      if (item.precio_x1) pricesToInsert.push({ item_id: itemRecord.id, label: 'x1', price: item.precio_x1 });
      if (item.precio_x2) pricesToInsert.push({ item_id: itemRecord.id, label: 'x2', price: item.precio_x2 });
      if (item.precio_agua) pricesToInsert.push({ item_id: itemRecord.id, label: 'agua', price: item.precio_agua });
      if (item.precio_soda) pricesToInsert.push({ item_id: itemRecord.id, label: 'soda', price: item.precio_soda });
      if (item.precio_leche) pricesToInsert.push({ item_id: itemRecord.id, label: 'leche', price: item.precio_leche });

      if (pricesToInsert.length > 0) {
        const { error: priceError } = await supabase.from('prices').insert(pricesToInsert);
        if (priceError) {
          console.error(`    ❌ Error al insertar precios para ${item.nombre}:`, priceError.message);
        }
      }
    }
  }

  console.log('\n✨ Migración completada con éxito.');
}

migrate().catch(err => {
  console.error('💥 Error fatal durante la migración:', err);
});
