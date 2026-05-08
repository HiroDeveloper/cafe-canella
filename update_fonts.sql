ALTER TABLE categories ADD COLUMN IF NOT EXISTS font_family TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS font_family TEXT;
ALTER TABLE restaurant_info ADD COLUMN IF NOT EXISTS font_settings JSONB DEFAULT '{
  "title_font": "var(--font-next-serif)",
  "tagline_font": "var(--font-next-serif)",
  "schedule_font": "var(--font-next-serif)",
  "address_font": "var(--font-next-serif)",
  "footer_font": "var(--font-next-sans)"
}';
