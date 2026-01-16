-- Create function to atomically increment email usage counter
CREATE OR REPLACE FUNCTION increment_email_usage(workspace_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE workspaces
    SET emails_sent_this_month = emails_sent_this_month + 1
    WHERE id = workspace_id_param;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_email_usage(UUID) TO authenticated, anon, service_role;
