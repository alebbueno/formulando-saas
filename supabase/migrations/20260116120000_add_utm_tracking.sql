-- Add UTM tracking columns to leads table for campaign attribution
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS utm_source text,
ADD COLUMN IF NOT EXISTS utm_medium text,
ADD COLUMN IF NOT EXISTS utm_campaign text,
ADD COLUMN IF NOT EXISTS utm_content text,
ADD COLUMN IF NOT EXISTS utm_term text,
ADD COLUMN IF NOT EXISTS landing_page_url text,
ADD COLUMN IF NOT EXISTS referrer text;

-- Add indexes for common UTM queries (improve performance for reports)
CREATE INDEX IF NOT EXISTS idx_leads_utm_source ON leads(utm_source);
CREATE INDEX IF NOT EXISTS idx_leads_utm_campaign ON leads(utm_campaign);

-- Add comment for documentation
COMMENT ON COLUMN leads.utm_source IS 'Traffic source (e.g., facebook, google, linkedin, tiktok)';
COMMENT ON COLUMN leads.utm_medium IS 'Marketing medium (e.g., cpc, email, social)';
COMMENT ON COLUMN leads.utm_campaign IS 'Campaign name';
COMMENT ON COLUMN leads.utm_content IS 'Ad variation/creative identifier';
COMMENT ON COLUMN leads.utm_term IS 'Keywords (mainly for search ads)';
COMMENT ON COLUMN leads.landing_page_url IS 'Full URL where lead landed (with UTM params)';
COMMENT ON COLUMN leads.referrer IS 'HTTP referrer (previous page URL)';
