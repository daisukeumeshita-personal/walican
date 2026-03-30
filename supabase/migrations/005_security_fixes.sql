-- =============================================
-- Security fixes
-- =============================================

-- Fix: invitation CREATE policy was using is_group_member instead of is_group_owner
DROP POLICY IF EXISTS "Group owners can create invitations" ON group_invitations;

CREATE POLICY "Group owners can create invitations"
  ON group_invitations FOR INSERT
  TO authenticated
  WITH CHECK (is_group_owner(group_id));

-- Fix: remove email from get_invitation_details (unnecessary exposure)
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
