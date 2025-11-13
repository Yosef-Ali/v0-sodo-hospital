-- ============================================
-- SODO Hospital Database Seed Script
-- Run this in Neon SQL Editor
-- ============================================

-- Drop existing tables and enums (if needed for fresh start)
-- Uncomment the following section if you want to start fresh
/*
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS permit_history CASCADE;
DROP TABLE IF EXISTS permit_checklist_items CASCADE;
DROP TABLE IF EXISTS checklists CASCADE;
DROP TABLE IF EXISTS permits CASCADE;
DROP TABLE IF EXISTS people CASCADE;
DROP TABLE IF EXISTS documents_v2 CASCADE;
DROP TABLE IF EXISTS tasks_v2 CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS event_type CASCADE;
DROP TYPE IF EXISTS permit_status CASCADE;
DROP TYPE IF EXISTS permit_category CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS document_status CASCADE;
DROP TYPE IF EXISTS task_priority CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
*/

-- ============================================
-- 1. CREATE ENUMS
-- ============================================

CREATE TYPE task_status AS ENUM ('pending', 'in-progress', 'completed', 'urgent');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE document_status AS ENUM ('pending', 'approved', 'review');
CREATE TYPE user_role AS ENUM ('ADMIN', 'HR_MANAGER', 'HR', 'LOGISTICS', 'FINANCE', 'USER');
CREATE TYPE permit_category AS ENUM ('WORK_PERMIT', 'RESIDENCE_ID', 'LICENSE', 'PIP');
CREATE TYPE permit_status AS ENUM ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'EXPIRED');
CREATE TYPE event_type AS ENUM ('permit', 'deadline', 'meeting', 'interview', 'other');

-- ============================================
-- 2. CREATE TABLES
-- ============================================

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_auth_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  password VARCHAR(255),
  role user_role NOT NULL DEFAULT 'USER',
  locale VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Departments table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  head_id UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  department_id UUID REFERENCES departments(id),
  leader_id UUID REFERENCES users(id),
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  color VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'pending',
  priority task_priority NOT NULL DEFAULT 'medium',
  due_date TIMESTAMP,
  assignee_id UUID REFERENCES users(id),
  category_id UUID REFERENCES categories(id),
  department_id UUID REFERENCES departments(id),
  created_by_id UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status document_status NOT NULL DEFAULT 'pending',
  category_id UUID REFERENCES categories(id),
  file_type VARCHAR(50),
  file_size VARCHAR(50),
  file_url TEXT,
  owner_id UUID REFERENCES users(id),
  department_id UUID REFERENCES departments(id),
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  parent_id UUID REFERENCES comments(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Team members junction table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  role VARCHAR(100),
  joined_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- People table
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  nationality VARCHAR(100),
  passport_no VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  guardian_id UUID REFERENCES people(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Checklists table
CREATE TABLE checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category permit_category,
  items JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Permits table
CREATE TABLE permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category permit_category NOT NULL,
  status permit_status NOT NULL DEFAULT 'PENDING',
  person_id UUID REFERENCES people(id) NOT NULL,
  due_date TIMESTAMP,
  due_date_ec VARCHAR(20),
  checklist_id UUID REFERENCES checklists(id),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Permit checklist items table
CREATE TABLE permit_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_id UUID REFERENCES permits(id) NOT NULL,
  label VARCHAR(500) NOT NULL,
  required BOOLEAN NOT NULL DEFAULT false,
  hint TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_by UUID REFERENCES users(id),
  completed_at TIMESTAMP,
  file_urls JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Permit history table
CREATE TABLE permit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_id UUID REFERENCES permits(id) NOT NULL,
  from_status permit_status NOT NULL,
  to_status permit_status NOT NULL,
  changed_by UUID REFERENCES users(id) NOT NULL,
  notes TEXT,
  changed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tasks V2 table
CREATE TABLE tasks_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'pending',
  priority task_priority NOT NULL DEFAULT 'medium',
  due_date TIMESTAMP,
  assignee_id UUID REFERENCES users(id),
  permit_id UUID REFERENCES permits(id),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Documents V2 table
CREATE TABLE documents_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(100) NOT NULL,
  title VARCHAR(500),
  issued_by VARCHAR(255),
  number VARCHAR(100),
  issue_date TIMESTAMP,
  expiry_date TIMESTAMP,
  file_url TEXT,
  file_size INTEGER,
  mime_type VARCHAR(100),
  person_id UUID REFERENCES people(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Calendar Events table
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  type event_type NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  start_time VARCHAR(10),
  end_time VARCHAR(10),
  all_day BOOLEAN NOT NULL DEFAULT false,
  location VARCHAR(255),
  related_person_id UUID REFERENCES people(id),
  related_permit_id UUID REFERENCES permits(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. SEED DATA
-- ============================================

-- Insert Users
INSERT INTO users (email, name, password, role) VALUES
  ('admin@sodohospital.com', 'System Administrator', '$2a$10$rOzJw6z6vK5nKZ5qZ5qZ5e5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZu', 'ADMIN'),
  ('hr.manager@sodohospital.com', 'HR Manager', '$2a$10$rOzJw6z6vK5nKZ5qZ5qZ5e5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZu', 'HR_MANAGER'),
  ('hr.staff@sodohospital.com', 'HR Staff', '$2a$10$rOzJw6z6vK5nKZ5qZ5qZ5e5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZu', 'HR'),
  ('logistics@sodohospital.com', 'Logistics Officer', '$2a$10$rOzJw6z6vK5nKZ5qZ5qZ5e5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZu', 'LOGISTICS');

-- Insert Departments
INSERT INTO departments (name, description, head_id) VALUES
  ('Human Resources', 'Manages employee relations and permits', (SELECT id FROM users WHERE email = 'hr.manager@sodohospital.com')),
  ('Medical Staff', 'Clinical and medical personnel', NULL),
  ('Administration', 'Administrative and support staff', (SELECT id FROM users WHERE email = 'admin@sodohospital.com'));

-- Insert Categories
INSERT INTO categories (name, type, color) VALUES
  ('Work Permit', 'permit', 'blue'),
  ('Residence ID', 'permit', 'green'),
  ('License', 'permit', 'purple'),
  ('Document Verification', 'task', 'orange'),
  ('Interview', 'task', 'red'),
  ('Onboarding', 'task', 'teal');

-- Insert People
INSERT INTO people (first_name, last_name, nationality, passport_no, phone, email) VALUES
  ('Sarah', 'Johnson', 'USA', 'US123456', '+1-555-0101', 'sarah.johnson@example.com'),
  ('Maria', 'Garcia', 'Spain', 'ES789012', '+34-555-0102', 'maria.garcia@example.com'),
  ('Ahmed', 'Hassan', 'Egypt', 'EG345678', '+20-555-0103', 'ahmed.hassan@example.com'),
  ('Yuki', 'Tanaka', 'Japan', 'JP901234', '+81-555-0104', 'yuki.tanaka@example.com'),
  ('Emma', 'Williams', 'UK', 'GB567890', '+44-555-0105', 'emma.williams@example.com');

-- Insert Checklists
INSERT INTO checklists (name, category, items, version, active, created_by) VALUES
  (
    'Work Permit Standard Checklist',
    'WORK_PERMIT',
    '[
      {"label": "Valid Passport Copy", "required": true, "hint": "Must be valid for at least 6 months"},
      {"label": "Employment Contract", "required": true, "hint": "Signed by both parties"},
      {"label": "Educational Certificates", "required": true, "hint": "Authenticated copies"},
      {"label": "Health Certificate", "required": true, "hint": "From approved medical center"},
      {"label": "Police Clearance", "required": false, "hint": "From country of origin"}
    ]'::jsonb,
    1,
    true,
    (SELECT id FROM users WHERE email = 'admin@sodohospital.com')
  ),
  (
    'Residence ID Checklist',
    'RESIDENCE_ID',
    '[
      {"label": "Passport Copy", "required": true, "hint": "Valid passport"},
      {"label": "Work Permit Copy", "required": true, "hint": "Approved work permit"},
      {"label": "Proof of Residence", "required": true, "hint": "Rental agreement or utility bill"},
      {"label": "Passport Photos", "required": true, "hint": "2 recent photos"}
    ]'::jsonb,
    1,
    true,
    (SELECT id FROM users WHERE email = 'admin@sodohospital.com')
  ),
  (
    'Professional License Checklist',
    'LICENSE',
    '[
      {"label": "Original License", "required": true, "hint": "From country of origin"},
      {"label": "License Verification Letter", "required": true, "hint": "From issuing authority"},
      {"label": "Professional Experience Letter", "required": true, "hint": "Minimum 2 years"},
      {"label": "Good Standing Certificate", "required": true, "hint": "From professional body"}
    ]'::jsonb,
    1,
    true,
    (SELECT id FROM users WHERE email = 'admin@sodohospital.com')
  );

-- Insert Permits
INSERT INTO permits (category, status, person_id, due_date, checklist_id, notes) VALUES
  (
    'WORK_PERMIT',
    'SUBMITTED',
    (SELECT id FROM people WHERE first_name = 'Sarah' AND last_name = 'Johnson'),
    NOW() + INTERVAL '30 days',
    (SELECT id FROM checklists WHERE name = 'Work Permit Standard Checklist'),
    'Priority processing requested'
  ),
  (
    'RESIDENCE_ID',
    'PENDING',
    (SELECT id FROM people WHERE first_name = 'Maria' AND last_name = 'Garcia'),
    NOW() + INTERVAL '45 days',
    (SELECT id FROM checklists WHERE name = 'Residence ID Checklist'),
    'Waiting for work permit approval'
  ),
  (
    'LICENSE',
    'APPROVED',
    (SELECT id FROM people WHERE first_name = 'Ahmed' AND last_name = 'Hassan'),
    NOW() + INTERVAL '365 days',
    (SELECT id FROM checklists WHERE name = 'Professional License Checklist'),
    'License approved for 1 year'
  ),
  (
    'WORK_PERMIT',
    'PENDING',
    (SELECT id FROM people WHERE first_name = 'Yuki' AND last_name = 'Tanaka'),
    NOW() + INTERVAL '60 days',
    (SELECT id FROM checklists WHERE name = 'Work Permit Standard Checklist'),
    'Initial application'
  );

-- Insert Tasks V2
INSERT INTO tasks_v2 (title, description, status, priority, due_date, assignee_id, permit_id) VALUES
  (
    'Review Work Permit Application',
    'Review Sarah Johnson work permit documents',
    'in-progress',
    'high',
    NOW() + INTERVAL '3 days',
    (SELECT id FROM users WHERE email = 'hr.staff@sodohospital.com'),
    (SELECT id FROM permits WHERE person_id = (SELECT id FROM people WHERE first_name = 'Sarah'))
  ),
  (
    'Follow up on Residence ID Status',
    'Check status with immigration office',
    'pending',
    'medium',
    NOW() + INTERVAL '7 days',
    (SELECT id FROM users WHERE email = 'hr.staff@sodohospital.com'),
    (SELECT id FROM permits WHERE person_id = (SELECT id FROM people WHERE first_name = 'Maria'))
  ),
  (
    'Verify Educational Certificates',
    'Authenticate educational documents for Yuki',
    'pending',
    'medium',
    NOW() + INTERVAL '5 days',
    (SELECT id FROM users WHERE email = 'hr.manager@sodohospital.com'),
    (SELECT id FROM permits WHERE person_id = (SELECT id FROM people WHERE first_name = 'Yuki'))
  );

-- Insert Calendar Events
INSERT INTO calendar_events (title, description, type, start_date, start_time, all_day, related_person_id, created_by) VALUES
  (
    'Work Permit Review - Sarah Johnson',
    'Review all submitted documents for work permit',
    'permit',
    NOW() + INTERVAL '2 days',
    '10:00 AM',
    false,
    (SELECT id FROM people WHERE first_name = 'Sarah' AND last_name = 'Johnson'),
    (SELECT id FROM users WHERE email = 'hr.staff@sodohospital.com')
  ),
  (
    'Permit Expiry Deadline',
    'Ahmed Hassan license renewal deadline',
    'deadline',
    NOW() + INTERVAL '30 days',
    NULL,
    true,
    (SELECT id FROM people WHERE first_name = 'Ahmed' AND last_name = 'Hassan'),
    (SELECT id FROM users WHERE email = 'hr.manager@sodohospital.com')
  ),
  (
    'Team Meeting',
    'Monthly HR review meeting',
    'meeting',
    NOW() + INTERVAL '7 days',
    '2:00 PM',
    false,
    NULL,
    (SELECT id FROM users WHERE email = 'hr.manager@sodohospital.com')
  ),
  (
    'Candidate Interview - Emma Williams',
    'Initial interview for nursing position',
    'interview',
    NOW() + INTERVAL '5 days',
    '11:00 AM',
    false,
    (SELECT id FROM people WHERE first_name = 'Emma' AND last_name = 'Williams'),
    (SELECT id FROM users WHERE email = 'hr.staff@sodohospital.com')
  ),
  (
    'Document Submission Deadline',
    'Final date for Yuki to submit remaining documents',
    'deadline',
    NOW() + INTERVAL '14 days',
    NULL,
    true,
    (SELECT id FROM people WHERE first_name = 'Yuki' AND last_name = 'Tanaka'),
    (SELECT id FROM users WHERE email = 'hr.staff@sodohospital.com')
  );

-- Insert Permit Checklist Items (sample progress)
INSERT INTO permit_checklist_items (permit_id, label, required, hint, completed, completed_by, completed_at) VALUES
  (
    (SELECT id FROM permits WHERE person_id = (SELECT id FROM people WHERE first_name = 'Sarah')),
    'Valid Passport Copy',
    true,
    'Must be valid for at least 6 months',
    true,
    (SELECT id FROM users WHERE email = 'hr.staff@sodohospital.com'),
    NOW() - INTERVAL '2 days'
  ),
  (
    (SELECT id FROM permits WHERE person_id = (SELECT id FROM people WHERE first_name = 'Sarah')),
    'Employment Contract',
    true,
    'Signed by both parties',
    true,
    (SELECT id FROM users WHERE email = 'hr.staff@sodohospital.com'),
    NOW() - INTERVAL '2 days'
  ),
  (
    (SELECT id FROM permits WHERE person_id = (SELECT id FROM people WHERE first_name = 'Sarah')),
    'Educational Certificates',
    true,
    'Authenticated copies',
    false,
    NULL,
    NULL
  );

-- Insert Activity Logs
INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES
  (
    (SELECT id FROM users WHERE email = 'hr.staff@sodohospital.com'),
    'created',
    'permit',
    (SELECT id FROM permits WHERE person_id = (SELECT id FROM people WHERE first_name = 'Sarah')),
    '{"category": "WORK_PERMIT", "person": "Sarah Johnson"}'::jsonb
  ),
  (
    (SELECT id FROM users WHERE email = 'hr.staff@sodohospital.com'),
    'updated',
    'permit',
    (SELECT id FROM permits WHERE person_id = (SELECT id FROM people WHERE first_name = 'Sarah')),
    '{"status": "SUBMITTED", "previous_status": "PENDING"}'::jsonb
  );

-- ============================================
-- 4. CREATE INDEXES (for performance)
-- ============================================

CREATE INDEX idx_permits_person_id ON permits(person_id);
CREATE INDEX idx_permits_status ON permits(status);
CREATE INDEX idx_permits_category ON permits(category);
CREATE INDEX idx_calendar_events_start_date ON calendar_events(start_date);
CREATE INDEX idx_calendar_events_type ON calendar_events(type);
CREATE INDEX idx_tasks_v2_assignee_id ON tasks_v2(assignee_id);
CREATE INDEX idx_tasks_v2_permit_id ON tasks_v2(permit_id);
CREATE INDEX idx_permit_checklist_items_permit_id ON permit_checklist_items(permit_id);
CREATE INDEX idx_people_email ON people(email);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify data insertion
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'People', COUNT(*) FROM people
UNION ALL
SELECT 'Permits', COUNT(*) FROM permits
UNION ALL
SELECT 'Checklists', COUNT(*) FROM checklists
UNION ALL
SELECT 'Calendar Events', COUNT(*) FROM calendar_events
UNION ALL
SELECT 'Tasks V2', COUNT(*) FROM tasks_v2
UNION ALL
SELECT 'Departments', COUNT(*) FROM departments
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories;

-- Show sample data
SELECT
  p.first_name || ' ' || p.last_name as person_name,
  pe.category,
  pe.status,
  pe.due_date,
  c.name as checklist_name
FROM permits pe
JOIN people p ON pe.person_id = p.id
LEFT JOIN checklists c ON pe.checklist_id = c.id
ORDER BY pe.created_at DESC;
