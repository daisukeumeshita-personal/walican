-- =============================================
-- Fix: infinite recursion in group_members RLS
-- =============================================
-- SECURITY DEFINER functions bypass RLS, breaking the recursion chain.

CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = p_group_id
      AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_owner(p_group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = p_group_id
      AND user_id = auth.uid()
      AND role = 'owner'
  );
$$;

-- ============ group_members policies ============

DROP POLICY IF EXISTS "Group members can view memberships" ON group_members;
CREATE POLICY "Group members can view memberships"
  ON group_members FOR SELECT
  TO authenticated
  USING (is_group_member(group_id));

DROP POLICY IF EXISTS "Can add members to groups" ON group_members;
CREATE POLICY "Can add members to groups"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    is_group_owner(group_id)
    OR auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Can remove group members" ON group_members;
CREATE POLICY "Can remove group members"
  ON group_members FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR is_group_owner(group_id)
  );

-- ============ groups policies ============

DROP POLICY IF EXISTS "Group members can view group" ON groups;
CREATE POLICY "Group members can view group"
  ON groups FOR SELECT
  TO authenticated
  USING (is_group_member(id));

-- ============ expenses policies ============

DROP POLICY IF EXISTS "Group members can view expenses" ON expenses;
CREATE POLICY "Group members can view expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (is_group_member(group_id));

DROP POLICY IF EXISTS "Group members can create expenses" ON expenses;
CREATE POLICY "Group members can create expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    is_group_member(group_id)
    AND auth.uid() = created_by
  );

-- ============ expense_splits policies ============

DROP POLICY IF EXISTS "Group members can view splits" ON expense_splits;
CREATE POLICY "Group members can view splits"
  ON expense_splits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expenses e
      WHERE e.id = expense_splits.expense_id
        AND is_group_member(e.group_id)
    )
  );

DROP POLICY IF EXISTS "Group members can create splits" ON expense_splits;
CREATE POLICY "Group members can create splits"
  ON expense_splits FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM expenses e
      WHERE e.id = expense_splits.expense_id
        AND is_group_member(e.group_id)
    )
  );

-- ============ shopping_items policies ============

DROP POLICY IF EXISTS "Group members can view shopping items" ON shopping_items;
CREATE POLICY "Group members can view shopping items"
  ON shopping_items FOR SELECT
  TO authenticated
  USING (is_group_member(group_id));

DROP POLICY IF EXISTS "Group members can create shopping items" ON shopping_items;
CREATE POLICY "Group members can create shopping items"
  ON shopping_items FOR INSERT
  TO authenticated
  WITH CHECK (
    is_group_member(group_id)
    AND auth.uid() = created_by
  );

DROP POLICY IF EXISTS "Group members can update shopping items" ON shopping_items;
CREATE POLICY "Group members can update shopping items"
  ON shopping_items FOR UPDATE
  TO authenticated
  USING (is_group_member(group_id));

DROP POLICY IF EXISTS "Group members can delete shopping items" ON shopping_items;
CREATE POLICY "Group members can delete shopping items"
  ON shopping_items FOR DELETE
  TO authenticated
  USING (is_group_member(group_id));
