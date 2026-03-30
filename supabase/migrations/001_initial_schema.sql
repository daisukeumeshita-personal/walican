-- =============================================
-- Splitwise Clone - Initial Database Schema
-- =============================================

-- Profiles table (mirrors auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Group members table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Helper functions (SECURITY DEFINER bypasses RLS)
-- Prevents infinite recursion in self-referencing policies
-- =============================================

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

-- Groups RLS
CREATE POLICY "Group members can view group"
  ON groups FOR SELECT
  TO authenticated
  USING (is_group_member(id));

CREATE POLICY "Authenticated users can create groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creator can update group"
  ON groups FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creator can delete group"
  ON groups FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Group members RLS
CREATE POLICY "Group members can view memberships"
  ON group_members FOR SELECT
  TO authenticated
  USING (is_group_member(group_id));

CREATE POLICY "Can add members to groups"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    is_group_owner(group_id)
    OR auth.uid() = user_id
  );

CREATE POLICY "Can remove group members"
  ON group_members FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR is_group_owner(group_id)
  );

-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL,
  paid_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  split_method TEXT NOT NULL CHECK (split_method IN ('equal', 'exact', 'percentage')),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (is_group_member(group_id));

CREATE POLICY "Group members can create expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    is_group_member(group_id)
    AND auth.uid() = created_by
  );

CREATE POLICY "Expense creator can update"
  ON expenses FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Expense creator can delete"
  ON expenses FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Expense splits table
CREATE TABLE expense_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  percentage NUMERIC(5,2),
  UNIQUE(expense_id, user_id)
);

ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Expense creator can update splits"
  ON expense_splits FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expenses e
      WHERE e.id = expense_splits.expense_id
        AND e.created_by = auth.uid()
    )
  );

CREATE POLICY "Expense creator can delete splits"
  ON expense_splits FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expenses e
      WHERE e.id = expense_splits.expense_id
        AND e.created_by = auth.uid()
    )
  );

-- Shopping items table
CREATE TABLE shopping_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_checked BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view shopping items"
  ON shopping_items FOR SELECT
  TO authenticated
  USING (is_group_member(group_id));

CREATE POLICY "Group members can create shopping items"
  ON shopping_items FOR INSERT
  TO authenticated
  WITH CHECK (
    is_group_member(group_id)
    AND auth.uid() = created_by
  );

CREATE POLICY "Group members can update shopping items"
  ON shopping_items FOR UPDATE
  TO authenticated
  USING (is_group_member(group_id));

CREATE POLICY "Group members can delete shopping items"
  ON shopping_items FOR DELETE
  TO authenticated
  USING (is_group_member(group_id));
