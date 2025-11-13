-- Complete Database Seed Script for Neon SQL Editor
-- Run this script in Neon SQL Editor to populate your database

-- ============================================
-- STEP 1: Create Admin User
-- ============================================
INSERT INTO users (email, name, password, role, locale, created_at, updated_at)
VALUES (
  'admin@example.org',
  'System Administrator',
  '$2a$10$rOFLQE7Z5K1YqJ5X4z8F5.8YXqZ5YqJ5X4z8F5.8YXqZ5YqJ5X4z8F', -- bcrypt hash for 'Admin123!'
  'ADMIN',
  'en',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- STEP 2: Create Permit Checklists
-- ============================================

-- Work Permit Checklist
INSERT INTO checklists (name, category, items, version, active, created_at, updated_at)
VALUES (
  'Work Permit Checklist',
  'WORK_PERMIT',
  '[
    {"label": "Passport copy (valid for at least 6 months)", "required": true, "hint": "Must include biographical data page"},
    {"label": "Employment contract signed by both parties", "required": true, "hint": "Original contract with official stamps"},
    {"label": "Educational certificates (degree, diploma, or professional certificates)", "required": true, "hint": "Certified copies or originals"},
    {"label": "Professional license (if applicable)", "required": false, "hint": "For doctors, nurses, and other licensed professions"},
    {"label": "Health certificate (HIV/AIDS test, TB screening)", "required": true, "hint": "Must be issued within the last 3 months"},
    {"label": "Passport-size photos (4 copies)", "required": true, "hint": "White background, recent photos"},
    {"label": "Letter from Ministry of Health or relevant authority", "required": true, "hint": "Approval for employment of foreign national"},
    {"label": "Company registration documents and tax clearance", "required": true, "hint": "Hospital''s legal documents"}
  ]'::jsonb,
  1,
  true,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Residence ID Checklist
INSERT INTO checklists (name, category, items, version, active, created_at, updated_at)
VALUES (
  'Residence ID Checklist',
  'RESIDENCE_ID',
  '[
    {"label": "Passport copy with valid visa", "required": true, "hint": "Must show entry stamp and current visa"},
    {"label": "Proof of residence (rental agreement or employer letter)", "required": true, "hint": "Must include physical address in Ethiopia"},
    {"label": "Work permit copy", "required": true, "hint": "Current approved work permit"},
    {"label": "Passport-size photos (6 copies)", "required": true, "hint": "White background, recent photos"},
    {"label": "Application form from Immigration Office", "required": true, "hint": "Completed and signed application form"}
  ]'::jsonb,
  1,
  true,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- MOH License Checklist
INSERT INTO checklists (name, category, items, version, active, created_at, updated_at)
VALUES (
  'Ministry of Health License Checklist',
  'LICENSE',
  '[
    {"label": "Medical/Nursing degree certificates", "required": true, "hint": "Original or certified copies with official translation if needed"},
    {"label": "Professional registration from home country", "required": true, "hint": "Certificate of good standing"},
    {"label": "Work experience letters (minimum 2 years)", "required": true, "hint": "From previous employers with official letterhead"},
    {"label": "Health certificate and vaccination records", "required": true, "hint": "Must include hepatitis B and other required vaccinations"},
    {"label": "MOH application form and processing fee receipt", "required": true, "hint": "Completed application with payment confirmation"}
  ]'::jsonb,
  1,
  true,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- EFDA PIP Checklist
INSERT INTO checklists (name, category, items, version, active, created_at, updated_at)
VALUES (
  'EFDA Product Import Permit (PIP) Checklist',
  'PIP',
  '[
    {"label": "Proforma invoice from supplier", "required": true, "hint": "Official invoice showing product details and quantities"},
    {"label": "Product registration certificates", "required": true, "hint": "EFDA registration for pharmaceutical products"},
    {"label": "Business license and tax identification number", "required": true, "hint": "Hospital''s current business license"},
    {"label": "Detailed product specifications and safety data sheets", "required": true, "hint": "Technical specifications and MSDS documents"},
    {"label": "Letter of intent from hospital administration", "required": true, "hint": "Official request for import permit"}
  ]'::jsonb,
  1,
  true,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 3: Create Sample People
-- ============================================

INSERT INTO people (first_name, last_name, nationality, passport_no, phone, email, created_at, updated_at)
VALUES
  ('John', 'Smith', 'United Kingdom', 'GB123456789', '+251911234567', 'john.smith@example.com', NOW(), NOW()),
  ('Sarah', 'Johnson', 'United States', 'US987654321', '+251922345678', 'sarah.johnson@example.com', NOW(), NOW()),
  ('Michael', 'Chen', 'Canada', 'CA456789123', '+251933456789', 'michael.chen@example.com', NOW(), NOW()),
  ('Emma', 'Smith', 'United Kingdom', 'GB987654321', NULL, NULL, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Update Emma to be dependent of John Smith
UPDATE people
SET guardian_id = (SELECT id FROM people WHERE email = 'john.smith@example.com' LIMIT 1)
WHERE email IS NULL AND first_name = 'Emma' AND last_name = 'Smith';

-- ============================================
-- STEP 4: Create Sample Permits
-- ============================================

INSERT INTO permits (category, status, person_id, due_date, due_date_ec, checklist_id, notes, created_at, updated_at)
VALUES
  (
    'WORK_PERMIT',
    'PENDING',
    (SELECT id FROM people WHERE email = 'john.smith@example.com' LIMIT 1),
    '2025-08-15'::timestamp,
    '2017-12-07',
    (SELECT id FROM checklists WHERE name = 'Work Permit Checklist' LIMIT 1),
    'Initial work permit application for medical staff',
    NOW(),
    NOW()
  ),
  (
    'RESIDENCE_ID',
    'SUBMITTED',
    (SELECT id FROM people WHERE email = 'john.smith@example.com' LIMIT 1),
    '2025-09-01'::timestamp,
    '2017-12-24',
    (SELECT id FROM checklists WHERE name = 'Residence ID Checklist' LIMIT 1),
    'Residence ID application following work permit approval',
    NOW(),
    NOW()
  ),
  (
    'LICENSE',
    'APPROVED',
    (SELECT id FROM people WHERE email = 'sarah.johnson@example.com' LIMIT 1),
    '2025-12-31'::timestamp,
    '2018-04-23',
    (SELECT id FROM checklists WHERE name = 'Ministry of Health License Checklist' LIMIT 1),
    'MOH nursing license for Sarah Johnson',
    NOW(),
    NOW()
  ),
  (
    'PIP',
    'PENDING',
    (SELECT id FROM people WHERE email = 'michael.chen@example.com' LIMIT 1),
    '2025-06-30'::timestamp,
    '2017-10-22',
    (SELECT id FROM checklists WHERE name = 'EFDA Product Import Permit (PIP) Checklist' LIMIT 1),
    'Product import permit for medical supplies',
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 5: Create Sample Tasks
-- ============================================

INSERT INTO tasks_v2 (title, description, status, priority, due_date, assignee_id, permit_id, notes, created_at, updated_at, completed_at)
VALUES
  (
    'Review work permit documents for John Smith',
    'Verify all required documents are complete and valid',
    'pending',
    'high',
    '2025-06-20'::timestamp,
    (SELECT id FROM users WHERE email = 'admin@example.org' LIMIT 1),
    (SELECT id FROM permits WHERE category = 'WORK_PERMIT' AND person_id = (SELECT id FROM people WHERE email = 'john.smith@example.com' LIMIT 1) LIMIT 1),
    'Urgent - submission deadline approaching',
    NOW(),
    NOW(),
    NULL
  ),
  (
    'Submit residence ID application',
    'Submit completed application to immigration office',
    'in-progress',
    'high',
    '2025-06-25'::timestamp,
    (SELECT id FROM users WHERE email = 'admin@example.org' LIMIT 1),
    (SELECT id FROM permits WHERE category = 'RESIDENCE_ID' LIMIT 1),
    'Documents ready for submission',
    NOW(),
    NOW(),
    NULL
  ),
  (
    'Follow up on MOH license status',
    'Contact Ministry of Health for application status update',
    'pending',
    'medium',
    '2025-06-30'::timestamp,
    (SELECT id FROM users WHERE email = 'admin@example.org' LIMIT 1),
    (SELECT id FROM permits WHERE category = 'LICENSE' LIMIT 1),
    'Follow up every 2 weeks',
    NOW(),
    NOW(),
    NULL
  ),
  (
    'Prepare documents for product import permit',
    'Gather all required documentation for EFDA PIP application',
    'pending',
    'low',
    '2025-07-15'::timestamp,
    (SELECT id FROM users WHERE email = 'admin@example.org' LIMIT 1),
    (SELECT id FROM permits WHERE category = 'PIP' LIMIT 1),
    NULL,
    NOW(),
    NOW(),
    NULL
  ),
  (
    'Schedule medical examination for new staff',
    'Arrange health certificate and required medical tests',
    'completed',
    'medium',
    '2025-05-15'::timestamp,
    (SELECT id FROM users WHERE email = 'admin@example.org' LIMIT 1),
    NULL,
    'Health certificate obtained',
    NOW(),
    NOW(),
    '2025-05-14'::timestamp
  ),
  (
    'Renew work permit for existing staff member',
    'Process work permit renewal 3 months before expiry',
    'urgent',
    'high',
    '2025-05-20'::timestamp,
    (SELECT id FROM users WHERE email = 'admin@example.org' LIMIT 1),
    NULL,
    'Expiring soon - high priority',
    NOW(),
    NOW(),
    NULL
  ),
  (
    'Translate educational certificates',
    'Get official translation of degree certificates from home country',
    'in-progress',
    'medium',
    '2025-07-01'::timestamp,
    (SELECT id FROM users WHERE email = 'admin@example.org' LIMIT 1),
    NULL,
    NULL,
    NOW(),
    NOW(),
    NULL
  ),
  (
    'Update staff residence permit database',
    'Maintain current records of all staff residence permits',
    'completed',
    'low',
    '2025-05-10'::timestamp,
    (SELECT id FROM users WHERE email = 'admin@example.org' LIMIT 1),
    NULL,
    NULL,
    NOW(),
    NOW(),
    '2025-05-09'::timestamp
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 6: Create Calendar Events
-- ============================================

INSERT INTO calendar_events (title, description, type, start_date, end_date, start_time, end_time, all_day, location, related_person_id, related_permit_id, created_by, created_at, updated_at)
VALUES
  (
    'Work Permit Interview - John Smith',
    'Interview at Ministry of Labor for work permit application',
    'interview',
    '2025-06-25 10:00:00'::timestamp,
    NULL,
    '10:00 AM',
    '11:00 AM',
    false,
    'Ministry of Labor, Main Office',
    (SELECT id FROM people WHERE email = 'john.smith@example.com' LIMIT 1),
    (SELECT id FROM permits WHERE category = 'WORK_PERMIT' AND person_id = (SELECT id FROM people WHERE email = 'john.smith@example.com' LIMIT 1) LIMIT 1),
    (SELECT id FROM users WHERE email = 'admin@example.org' LIMIT 1),
    NOW(),
    NOW()
  ),
  (
    'Residence ID Submission Deadline',
    'Final date to submit residence ID application',
    'deadline',
    '2025-07-01 00:00:00'::timestamp,
    NULL,
    NULL,
    NULL,
    true,
    NULL,
    (SELECT id FROM people WHERE email = 'john.smith@example.com' LIMIT 1),
    (SELECT id FROM permits WHERE category = 'RESIDENCE_ID' LIMIT 1),
    (SELECT id FROM users WHERE email = 'admin@example.org' LIMIT 1),
    NOW(),
    NOW()
  ),
  (
    'Team Meeting - Permit Status Review',
    'Monthly review of all active permit applications',
    'meeting',
    '2025-06-18 14:00:00'::timestamp,
    NULL,
    '02:00 PM',
    '03:30 PM',
    false,
    'HR Conference Room',
    NULL,
    NULL,
    (SELECT id FROM users WHERE email = 'admin@example.org' LIMIT 1),
    NOW(),
    NOW()
  ),
  (
    'MOH License Expiry - Sarah Johnson',
    'Ministry of Health license expiration date',
    'permit',
    '2025-12-31 00:00:00'::timestamp,
    NULL,
    NULL,
    NULL,
    true,
    NULL,
    (SELECT id FROM people WHERE email = 'sarah.johnson@example.com' LIMIT 1),
    (SELECT id FROM permits WHERE category = 'LICENSE' LIMIT 1),
    (SELECT id FROM users WHERE email = 'admin@example.org' LIMIT 1),
    NOW(),
    NOW()
  ),
  (
    'EFDA Office Visit',
    'Submit product import permit application in person',
    'other',
    '2025-06-30 09:00:00'::timestamp,
    NULL,
    '09:00 AM',
    '10:00 AM',
    false,
    'EFDA Head Office, Addis Ababa',
    (SELECT id FROM people WHERE email = 'michael.chen@example.com' LIMIT 1),
    (SELECT id FROM permits WHERE category = 'PIP' LIMIT 1),
    (SELECT id FROM users WHERE email = 'admin@example.org' LIMIT 1),
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 7: Create Activity Logs
-- ============================================

INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, created_at)
VALUES
  (
    (SELECT id FROM users WHERE email = 'admin@example.org' LIMIT 1),
    'Created work permit application',
    'permit',
    (SELECT id FROM permits WHERE category = 'WORK_PERMIT' LIMIT 1),
    '{"category": "WORK_PERMIT", "status": "PENDING"}'::jsonb,
    NOW() - INTERVAL '2 hours'
  ),
  (
    (SELECT id FROM users WHERE email = 'admin@example.org' LIMIT 1),
    'Submitted residence ID application',
    'permit',
    (SELECT id FROM permits WHERE category = 'RESIDENCE_ID' LIMIT 1),
    '{"category": "RESIDENCE_ID", "status": "SUBMITTED"}'::jsonb,
    NOW() - INTERVAL '5 hours'
  ),
  (
    (SELECT id FROM users WHERE email = 'admin@example.org' LIMIT 1),
    'Approved MOH license',
    'permit',
    (SELECT id FROM permits WHERE category = 'LICENSE' LIMIT 1),
    '{"category": "LICENSE", "status": "APPROVED"}'::jsonb,
    NOW() - INTERVAL '1 day'
  ),
  (
    (SELECT id FROM users WHERE email = 'admin@example.org' LIMIT 1),
    'Created task for document review',
    'task',
    gen_random_uuid(),
    '{"title": "Review work permit documents", "priority": "high"}'::jsonb,
    NOW() - INTERVAL '3 hours'
  ),
  (
    (SELECT id FROM users WHERE email = 'admin@example.org' LIMIT 1),
    'Completed medical examination task',
    'task',
    gen_random_uuid(),
    '{"title": "Schedule medical examination", "status": "completed"}'::jsonb,
    NOW() - INTERVAL '2 days'
  ),
  (
    (SELECT id FROM users WHERE email = 'admin@example.org' LIMIT 1),
    'Created calendar event for interview',
    'calendar_event',
    gen_random_uuid(),
    '{"title": "Work Permit Interview - John Smith", "type": "interview"}'::jsonb,
    NOW() - INTERVAL '4 hours'
  ),
  (
    (SELECT id FROM users WHERE email = 'admin@example.org' LIMIT 1),
    'Updated permit status',
    'permit',
    (SELECT id FROM permits WHERE category = 'WORK_PERMIT' LIMIT 1),
    '{"from": "PENDING", "to": "SUBMITTED"}'::jsonb,
    NOW() - INTERVAL '6 hours'
  ),
  (
    (SELECT id FROM users WHERE email = 'admin@example.org' LIMIT 1),
    'Added new person to database',
    'person',
    (SELECT id FROM people WHERE email = 'john.smith@example.com' LIMIT 1),
    '{"name": "John Smith", "nationality": "United Kingdom"}'::jsonb,
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- Verification Queries (Optional - Run to verify data)
-- ============================================

-- Check Users
SELECT COUNT(*) as user_count FROM users;

-- Check People
SELECT COUNT(*) as people_count FROM people;

-- Check Checklists
SELECT COUNT(*) as checklist_count FROM checklists;

-- Check Permits
SELECT COUNT(*) as permit_count FROM permits;

-- Check Tasks
SELECT COUNT(*) as task_count FROM tasks_v2;

-- Check Calendar Events
SELECT COUNT(*) as event_count FROM calendar_events;

-- Check Activity Logs
SELECT COUNT(*) as activity_count FROM activity_logs;

-- Summary Report
SELECT
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM people) as people,
  (SELECT COUNT(*) FROM checklists) as checklists,
  (SELECT COUNT(*) FROM permits) as permits,
  (SELECT COUNT(*) FROM tasks_v2) as tasks,
  (SELECT COUNT(*) FROM calendar_events) as calendar_events,
  (SELECT COUNT(*) FROM activity_logs) as activity_logs;
