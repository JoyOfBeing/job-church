-- Elder application form submissions
CREATE TABLE IF NOT EXISTS elder_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  location text NOT NULL,
  background text NOT NULL,
  deconstruction text NOT NULL,
  plant_medicine text,
  ceremony text NOT NULL,
  modalities text NOT NULL,
  why_elder text NOT NULL,
  availability text NOT NULL,
  links text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'accepted', 'declined'))
);

-- Anyone can insert (public form), only admins can read
ALTER TABLE elder_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an elder application"
  ON elder_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view elder applications"
  ON elder_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update elder applications"
  ON elder_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM members WHERE id = auth.uid() AND is_admin = true
    )
  );
