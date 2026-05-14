-- Adds WhatsApp cart feature columns to restaurant_info
-- Run this once in your Supabase SQL editor

ALTER TABLE restaurant_info
  ADD COLUMN IF NOT EXISTS show_whatsapp_cart BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS cart_message_template TEXT DEFAULT NULL;
