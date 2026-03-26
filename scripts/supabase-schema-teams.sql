-- Supabase Schema for LeadFlow CRM with Multi-Tenancy (Teams)
-- Run this in your Supabase SQL Editor to create/update the tables

-- =====================================================
-- STEP 1: Create teams table
-- =====================================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID, -- Will reference users.id after users table is created
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 2: Modify users table to add team_id
-- =====================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS team_role TEXT DEFAULT 'member' CHECK (team_role IN ('owner', 'admin', 'member'));

-- Add index for faster team lookups
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);

-- =====================================================
-- STEP 3: Modify leads table to add team_id
-- =====================================================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;

-- Add index for team-based queries
CREATE INDEX IF NOT EXISTS idx_leads_team_id ON leads(team_id);

-- =====================================================
-- STEP 4: Modify settings table for per-team settings
-- =====================================================
ALTER TABLE settings DROP COLUMN IF EXISTS id;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS team_id UUID UNIQUE REFERENCES teams(id) ON DELETE CASCADE;

-- =====================================================
-- STEP 5: Create indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);

-- =====================================================
-- STEP 6: Create function to auto-update updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for teams
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 7: Update existing triggers
-- =====================================================
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 8: Create default team
-- =====================================================
INSERT INTO teams (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Team')
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 9: Assign existing users to default team
-- =====================================================
UPDATE users SET team_id = '00000000-0000-0000-0000-000000000001', team_role = 'owner' WHERE team_id IS NULL;

-- =====================================================
-- STEP 10: Assign existing leads to default team
-- =====================================================
UPDATE leads SET team_id = '00000000-0000-0000-0000-000000000001' WHERE team_id IS NULL;

-- =====================================================
-- STEP 11: Create default settings for default team
-- =====================================================
INSERT INTO settings (id, team_id)
VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 12: Enable Row Level Security (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Teams: Users can only see their team
CREATE POLICY "Users can view their team" ON teams
  FOR SELECT USING (
    id IN (SELECT team_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update their team" ON teams
  FOR UPDATE USING (
    id IN (SELECT team_id FROM users WHERE id = auth.uid() AND team_role IN ('owner', 'admin'))
  );

-- Users: Users can only see users in their team
CREATE POLICY "Users can view team members" ON users
  FOR SELECT USING (
    team_id IN (SELECT team_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update team members" ON users
  FOR UPDATE USING (
    team_id IN (SELECT team_id FROM users WHERE id = auth.uid() AND team_role IN ('owner', 'admin'))
  );

-- Leads: Users can only see leads in their team
CREATE POLICY "Users can view team leads" ON leads
  FOR SELECT USING (
    team_id IN (SELECT team_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert team leads" ON leads
  FOR INSERT WITH CHECK (
    team_id IN (SELECT team_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update team leads" ON leads
  FOR UPDATE USING (
    team_id IN (SELECT team_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete team leads" ON leads
  FOR DELETE USING (
    team_id IN (SELECT team_id FROM users WHERE id = auth.uid() AND team_role IN ('owner', 'admin'))
  );

-- Settings: Users can only see settings for their team
CREATE POLICY "Users can view team settings" ON settings
  FOR SELECT USING (
    team_id IN (SELECT team_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update team settings" ON settings
  FOR ALL USING (
    team_id IN (SELECT team_id FROM users WHERE id = auth.uid() AND team_role IN ('owner', 'admin'))
  );

-- =====================================================
-- NOTES FOR DEVELOPER:
-- =====================================================
-- 
-- 1. The SERVICE_ROLE_KEY bypasses RLS, so server-side code can access all data
-- 2. For client-side access, use the ANON_KEY - RLS will be enforced
-- 3. Users without a team_id will not be able to see any data until assigned
-- 4. Team owners can transfer ownership to another admin/member
--
-- =====================================================

-- =====================================================
-- SECURITY: Create function to fetch user by email (bypasses RLS)
-- This function uses SECURITY DEFINER which runs with the
-- privileges of the user who created it, bypassing RLS.
-- This is needed because we need to read users table for auth.
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_by_email(p_email TEXT)
RETURNS TABLE(
  id UUID,
  email TEXT,
  name TEXT,
  role TEXT,
  password TEXT,
  team_id UUID,
  team_role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.name, u.role, u.password, u.team_id, u.team_role
  FROM users u
  WHERE u.email ILIKE p_email
  LIMIT 1;
END;
$$;

-- =====================================================
-- KEY CONFIGURATION (new Supabase key model)
-- =====================================================
-- 
-- PUBLISHABLE KEY (safe for frontend - sb_publishable_*)
-- - Use in: NEXT_PUBLIC_SUPABASE_ANON_KEY
-- - Requires RLS policies on all tables
--
-- SECRET KEY (backend only - sb_secret_*)
-- - Use in: SUPABASE_SECRET_KEY (server-side only!)
-- - Has full access bypassing RLS
--
-- For more info: https://supabase.com/docs/guides/api/api-keys
-- =====================================================
