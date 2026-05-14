-- Reset corrupted cart_message_template
-- Run this in the Supabase SQL Editor
UPDATE restaurant_info
SET cart_message_template = NULL;
