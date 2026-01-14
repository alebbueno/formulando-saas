DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'form_submissions' AND column_name = 'lead_id') THEN
        ALTER TABLE form_submissions ADD COLUMN lead_id uuid REFERENCES leads(id) ON DELETE SET NULL;
        CREATE INDEX idx_form_submissions_lead_id ON form_submissions(lead_id);
    END IF;
END $$;
