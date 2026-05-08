-- Asegurar que las columnas de configuración existen en restaurant_info
ALTER TABLE restaurant_info ADD COLUMN IF NOT EXISTS show_font_switcher BOOLEAN DEFAULT true;
ALTER TABLE restaurant_info ADD COLUMN IF NOT EXISTS show_item_images BOOLEAN DEFAULT true;
