-- ============================================================
-- TutorFlow — Supabase (PostgreSQL) Setup Script
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Custom enum types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE profile_role AS ENUM ('tutor', 'student');
CREATE TYPE session_state AS ENUM ('scheduled', 'in_progress', 'completed', 'ai_reviewed');

-- 2. Users table (auth / session management)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  open_id VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  login_method VARCHAR(64),
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_signed_in TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. TutorFlow profiles (student / tutor onboarding data)
CREATE TABLE IF NOT EXISTS tutorflow_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  role profile_role NOT NULL DEFAULT 'student',
  full_name VARCHAR(240) NOT NULL,
  email VARCHAR(320),
  avatar_url TEXT,
  address TEXT,
  class_grade VARCHAR(120),
  school_college VARCHAR(240),
  learning_goals TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. Sessions (tutoring session records with state machine)
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  state session_state NOT NULL DEFAULT 'scheduled',
  topic VARCHAR(240) NOT NULL,
  live_notes TEXT,
  homework TEXT,
  ai_plan JSONB,
  ai_summary JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. Lesson materials (per-session content created by tutor)
CREATE TABLE IF NOT EXISTS lesson_materials (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL,
  tutor_id INTEGER NOT NULL,
  title VARCHAR(240) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 6. Tutor availability (weekly recurring slots: day 0 = Sunday)
CREATE TABLE IF NOT EXISTS tutor_availability (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL,
  start_time VARCHAR(5) NOT NULL,
  end_time VARCHAR(5) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 7. Invitation links (single-use student invitation tokens)
CREATE TABLE IF NOT EXISTS invitation_links (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL,
  code VARCHAR(21) NOT NULL UNIQUE,
  label TEXT,
  used_by_student_id INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 8. Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_users_open_id ON users (open_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON tutorflow_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tutor_id ON sessions (tutor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student_id ON sessions (student_id);
CREATE INDEX IF NOT EXISTS idx_materials_session_id ON lesson_materials (session_id);
CREATE INDEX IF NOT EXISTS idx_availability_tutor_id ON tutor_availability (tutor_id);
CREATE INDEX IF NOT EXISTS idx_invitations_code ON invitation_links (code);
CREATE INDEX IF NOT EXISTS idx_invitations_tutor_id ON invitation_links (tutor_id);

-- 9. Auto-update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON tutorflow_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
