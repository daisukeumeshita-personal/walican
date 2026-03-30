-- =============================================
-- SECURITY DEFINER function to get invitation details
-- Accessible without authentication (for invite landing page)
-- =============================================

CREATE OR REPLACE FUNCTION public.get_invitation_details(p_invitation_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', gi.id,
    'email', gi.email,
    'group_id', gi.group_id,
    'group_name', g.name,
    'inviter_name', p.display_name
  ) INTO result
  FROM group_invitations gi
  JOIN groups g ON g.id = gi.group_id
  JOIN profiles p ON p.id = gi.invited_by
  WHERE gi.id = p_invitation_id;

  RETURN result;
END;
$$;
