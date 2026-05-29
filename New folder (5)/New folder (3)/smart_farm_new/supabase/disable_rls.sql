-- Quick fix - disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT * FROM profiles LIMIT 1;