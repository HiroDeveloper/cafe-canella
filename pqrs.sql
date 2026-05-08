CREATE TABLE IF NOT EXISTS pqrs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pqrs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_pqrs" ON pqrs;
CREATE POLICY "public_insert_pqrs" ON pqrs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "admin_all_pqrs" ON pqrs;
CREATE POLICY "admin_all_pqrs" ON pqrs FOR ALL USING (auth.role() = 'authenticated');
