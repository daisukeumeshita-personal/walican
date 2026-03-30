-- =============================================
-- Group Invitations (for unregistered users)
-- =============================================

CREATE TABLE group_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, email)
);

ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view invitations"
  ON group_invitations FOR SELECT
  TO authenticated
  USING (is_group_member(group_id));

CREATE POLICY "Group owners can create invitations"
  ON group_invitations FOR INSERT
  TO authenticated
  WITH CHECK (is_group_member(group_id));

CREATE POLICY "Group owners can delete invitations"
  ON group_invitations FOR DELETE
  TO authenticated
  USING (is_group_owner(group_id));

-- =============================================
-- Update handle_new_user to process invitations
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );

  -- Process pending invitations
  INSERT INTO public.group_members (group_id, user_id, role)
  SELECT gi.group_id, NEW.id, 'member'
  FROM public.group_invitations gi
  WHERE lower(gi.email) = lower(NEW.email);

  -- Remove processed invitations
  DELETE FROM public.group_invitations
  WHERE lower(email) = lower(NEW.email);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
