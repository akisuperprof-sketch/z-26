
-- Z-26 Supabase Initial Schema

CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    raw_response JSONB,
    request_parts JSONB
);

-- Enable RLS (Optional but recommended)
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything (standard for backend)
CREATE POLICY "Allow all to service role" ON analyses
    FOR ALL
    USING (true)
    WITH CHECK (true);
