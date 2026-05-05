const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Usar la clave de servicio para evitar RLS al inicializar

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Iniciando carga de datos...');
  const jsonPath = path.resolve(__dirname, '../../menu_cafe_canella.json');
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(rawData);

  const menu = data.menu;
  let sortOrderCategory = 1;

  for (const [slug, catData] of Object.entries(menu)) {
    console.log(`Procesando categoría: ${catData.nombre}...`);
    
    // Insertar categoría
    const { data: category, error: catError } = await supabase
      .from('categories')
      .insert({
        slug: slug,
        name: catData.nombre,
        sort_order: sortOrderCategory++
      })
      .select()
      .single();

    if (catError) {
      console.error(`Error al insertar categoría ${catData.nombre}:`, catError);
      continue;
    }

    let sortOrderItem = 1;
    for (const item of catData.items) {
      // Insertar ítem
      const { data: menuItem, error: itemError } = await supabase
        .from('menu_items')
        .insert({
          category_id: category.id,
          name: item.nombre,
          description: item.descripcion || null,
          sort_order: sortOrderItem++
        })
        .select()
        .single();

      if (itemError) {
        console.error(`Error al insertar ítem ${item.nombre}:`, itemError);
        continue;
      }

      // Procesar precios
      const prices = [];
      if (item.precio) prices.push({ label: 'Precio', price: item.precio, sort_order: 1 });
      if (item.precio_sencillo) prices.push({ label: 'Sencillo', price: item.precio_sencillo, sort_order: 1 });
      if (item.precio_doble) prices.push({ label: 'Doble', price: item.precio_doble, sort_order: 2 });
      if (item.precio_x1) prices.push({ label: 'x1', price: item.precio_x1, sort_order: 1 });
      if (item.precio_x2) prices.push({ label: 'x2', price: item.precio_x2, sort_order: 2 });
      if (item.precio_agua) prices.push({ label: 'En Agua', price: item.precio_agua, sort_order: 1 });
      if (item.precio_soda) prices.push({ label: 'En Soda', price: item.precio_soda, sort_order: 2 });
      if (item.precio_leche) prices.push({ label: 'En Leche', price: item.precio_leche, sort_order: 2 });

      for (const p of prices) {
        const { error: priceError } = await supabase
          .from('item_prices')
          .insert({
            item_id: menuItem.id,
            label: p.label,
            price: p.price,
            sort_order: p.sort_order
          });
        
        if (priceError) {
          console.error(`Error al insertar precio para ${item.nombre}:`, priceError);
        }
      }
    }
  }

  console.log('¡Carga de datos completada!');
}

seed().catch(console.error);
