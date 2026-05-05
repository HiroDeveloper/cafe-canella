-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de categorías
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  icon        TEXT,
  image_url   TEXT,
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de ítems del menú
CREATE TABLE menu_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   UUID REFERENCES categories(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  image_url     TEXT,
  is_active     BOOLEAN DEFAULT true,
  is_featured   BOOLEAN DEFAULT false,
  is_new        BOOLEAN DEFAULT false,
  tags          TEXT[],
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de precios múltiples
CREATE TABLE item_prices (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id     UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  price       INT NOT NULL,
  sort_order  INT DEFAULT 0
);

-- Tabla de configuración del restaurante
CREATE TABLE restaurant_config (
  key   TEXT PRIMARY KEY,
  value TEXT
);

-- Configuración inicial por defecto
INSERT INTO restaurant_config (key, value) VALUES 
('name', 'Café Canella'),
('tagline', 'El mejor café de la ciudad'),
('domain', 'https://tu-dominio.com');

-- RLS (Row Level Security)

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_config ENABLE ROW LEVEL SECURITY;

-- Lectura pública para todos
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_menu_items" ON menu_items FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_item_prices" ON item_prices FOR SELECT USING (true);
CREATE POLICY "public_read_config" ON restaurant_config FOR SELECT USING (true);

-- Escritura solo para usuarios autenticados (el administrador)
CREATE POLICY "admin_write_categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_write_menu_items" ON menu_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_write_item_prices" ON item_prices FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_write_config" ON restaurant_config FOR ALL USING (auth.role() = 'authenticated');

-- Storage para imágenes
INSERT INTO storage.buckets (id, name, public) VALUES ('menu-images', 'menu-images', true) ON CONFLICT DO NOTHING;

CREATE POLICY "public_read_storage" ON storage.objects FOR SELECT USING (bucket_id = 'menu-images');
CREATE POLICY "admin_write_storage" ON storage.objects FOR ALL USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');
