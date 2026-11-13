-- =====================================================================
--  CAMPUS COMPLAINT & GRIEVANCE TRACKER — PURE MySQL 8.0+ SCRIPT
--  Department of Computer Engineering — DBMS Course Project
--  Academic Team: Chirag Simepurushkar, Raksham Dessai, Aayushi Prabhu
--
--  Database: MySQL 8.0+ / MariaDB 10.5+
--  Character Set: utf8mb4 | Engine: InnoDB
-- =====================================================================

CREATE DATABASE IF NOT EXISTS campus_complaint_tracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campus_complaint_tracker;

-- =====================================================================
-- 0. CLEANUP (Drop tables in reverse dependency order)
-- =====================================================================
DROP VIEW IF EXISTS v_staff_workload;
DROP VIEW IF EXISTS v_student_summary;
DROP VIEW IF EXISTS v_complaint_details;

DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS staff_assignment;
DROP TABLE IF EXISTS status_history;
DROP TABLE IF EXISTS complaint;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS student_phone;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS hostel;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS department;

-- =====================================================================
-- 1. RELATIONAL TABLES (DDL)
-- =====================================================================

-- 1.1 Department (Administrative handling unit)
CREATE TABLE department (
  dept_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  dept_name  VARCHAR(100) NOT NULL UNIQUE,
  dept_head  VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- 1.2 Staff (Maintenance staff, technicians, wardens, admins)
CREATE TABLE staff (
  staff_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name     VARCHAR(50)  NOT NULL,
  last_name      VARCHAR(50)  NOT NULL,
  designation    VARCHAR(60)  NOT NULL,
  email          VARCHAR(120) NOT NULL UNIQUE,
  dept_id        INT UNSIGNED NOT NULL,
  password_hash  VARCHAR(255) NULL,
  CONSTRAINT fk_staff_dept
    FOREIGN KEY (dept_id) REFERENCES department(dept_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 1.3 Hostel (Student residence blocks; 1:1 with warden)
CREATE TABLE hostel (
  hostel_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  hostel_name  VARCHAR(100) NOT NULL UNIQUE,
  warden_id    INT UNSIGNED NOT NULL UNIQUE,
  CONSTRAINT fk_hostel_warden
    FOREIGN KEY (warden_id) REFERENCES staff(staff_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 1.4 Student (Enrolled student filing complaints)
CREATE TABLE student (
  student_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name     VARCHAR(50)  NOT NULL,
  last_name      VARCHAR(50)  NOT NULL,
  email          VARCHAR(120) NOT NULL UNIQUE,
  room_no        VARCHAR(20)  NOT NULL,
  hostel_id      INT UNSIGNED NOT NULL,
  password_hash  VARCHAR(255) NULL,
  CONSTRAINT fk_student_hostel
    FOREIGN KEY (hostel_id) REFERENCES hostel(hostel_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 1.5 Student_Phone (Multivalued attribute Phone_Numbers)
CREATE TABLE student_phone (
  student_id    INT UNSIGNED NOT NULL,
  phone_number  VARCHAR(15)  NOT NULL,
  PRIMARY KEY (student_id, phone_number),
  CONSTRAINT fk_phone_student
    FOREIGN KEY (student_id) REFERENCES student(student_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- 1.6 Category (Complaint classifications with SLA days)
CREATE TABLE category (
  category_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_name  VARCHAR(80)  NOT NULL UNIQUE,
  sla_days       TINYINT UNSIGNED NOT NULL CHECK (sla_days > 0),
  dept_id        INT UNSIGNED NOT NULL,
  CONSTRAINT fk_cat_dept
    FOREIGN KEY (dept_id) REFERENCES department(dept_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 1.7 Complaint (Core Entity)
CREATE TABLE complaint (
  complaint_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  description   TEXT NOT NULL,
  status        ENUM('Open', 'Assigned', 'In-Progress', 'Resolved', 'Escalated') NOT NULL DEFAULT 'Open',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  student_id    INT UNSIGNED NOT NULL,
  category_id   INT UNSIGNED NOT NULL,
  CONSTRAINT fk_complaint_student
    FOREIGN KEY (student_id) REFERENCES student(student_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_complaint_category
    FOREIGN KEY (category_id) REFERENCES category(category_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 1.8 StatusHistory (Weak Entity; PK: complaint_id + history_num)
CREATE TABLE status_history (
  complaint_id  INT UNSIGNED NOT NULL,
  history_num   SMALLINT UNSIGNED NOT NULL,
  old_status    ENUM('Open', 'Assigned', 'In-Progress', 'Resolved', 'Escalated') NULL,
  new_status    ENUM('Open', 'Assigned', 'In-Progress', 'Resolved', 'Escalated') NOT NULL,
  changed_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  changed_by    VARCHAR(100) NOT NULL DEFAULT 'System',
  note          VARCHAR(255) NULL,
  PRIMARY KEY (complaint_id, history_num),
  CONSTRAINT fk_history_complaint
    FOREIGN KEY (complaint_id) REFERENCES complaint(complaint_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- 1.9 Staff_Assignment (N:M Junction linking Staff to Complaint)
CREATE TABLE staff_assignment (
  assignment_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  staff_id       INT UNSIGNED NOT NULL,
  complaint_id   INT UNSIGNED NOT NULL,
  assigned_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  unassigned_at  DATETIME NULL,
  CONSTRAINT fk_sa_staff
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_sa_complaint
    FOREIGN KEY (complaint_id) REFERENCES complaint(complaint_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- 1.10 Feedback (Post-resolution student ratings)
CREATE TABLE feedback (
  feedback_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  complaint_id  INT UNSIGNED NOT NULL UNIQUE,
  student_id    INT UNSIGNED NOT NULL,
  rating        TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comments      TEXT NULL,
  submitted_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_feedback_complaint
    FOREIGN KEY (complaint_id) REFERENCES complaint(complaint_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_feedback_student
    FOREIGN KEY (student_id) REFERENCES student(student_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- 1.11 Notification (Real-time in-app alerts)
CREATE TABLE notification (
  notification_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_email      VARCHAR(120) NOT NULL,
  message         TEXT NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================================
-- 2. INDEXES
-- =====================================================================
CREATE INDEX idx_complaint_student_created ON complaint (student_id, created_at DESC);
CREATE INDEX idx_complaint_status          ON complaint (status);
CREATE INDEX idx_staff_assignment_comp     ON staff_assignment (complaint_id);
CREATE INDEX idx_notification_user         ON notification (user_email, is_read);

-- =====================================================================
-- 3. RELATIONAL VIEWS
-- =====================================================================

-- 3.1 v_complaint_details (Comprehensive detail view)
CREATE OR REPLACE VIEW v_complaint_details AS
SELECT
  c.complaint_id,
  c.description,
  c.status,
  c.created_at,
  c.updated_at,
  s.student_id,
  CONCAT(s.first_name, ' ', s.last_name) AS student_name,
  s.email AS student_email,
  s.room_no,
  h.hostel_id,
  h.hostel_name,
  cat.category_id,
  cat.category_name,
  cat.sla_days,
  d.dept_id,
  d.dept_name AS handling_department,
  DATE_ADD(c.created_at, INTERVAL cat.sla_days DAY) AS sla_due_at,
  (c.status != 'Resolved' AND NOW() > DATE_ADD(c.created_at, INTERVAL cat.sla_days DAY)) AS is_overdue
FROM complaint c
JOIN student  s   ON s.student_id    = c.student_id
JOIN hostel   h   ON h.hostel_id     = s.hostel_id
JOIN category cat ON cat.category_id = c.category_id
JOIN department d ON d.dept_id       = cat.dept_id;

-- 3.2 v_student_summary (Derived count attribute)
CREATE OR REPLACE VIEW v_student_summary AS
SELECT
  s.student_id,
  s.first_name,
  s.last_name,
  s.email,
  s.room_no,
  h.hostel_name,
  COUNT(c.complaint_id) AS total_complaints_filed
FROM student s
JOIN hostel h ON h.hostel_id = s.hostel_id
LEFT JOIN complaint c ON c.student_id = s.student_id
GROUP BY s.student_id, s.first_name, s.last_name, s.email, s.room_no, h.hostel_name;

-- 3.3 v_staff_workload (Active vs total assignments)
CREATE OR REPLACE VIEW v_staff_workload AS
SELECT
  st.staff_id,
  CONCAT(st.first_name, ' ', st.last_name) AS staff_name,
  st.designation,
  d.dept_id,
  d.dept_name,
  SUM(CASE WHEN sa.unassigned_at IS NULL THEN 1 ELSE 0 END) AS active_assignments,
  COUNT(sa.assignment_id) AS total_assignments
FROM staff st
JOIN department d ON d.dept_id = st.dept_id
LEFT JOIN staff_assignment sa ON sa.staff_id = st.staff_id
GROUP BY st.staff_id, st.first_name, st.last_name, st.designation, d.dept_id, d.dept_name;

-- =====================================================================
-- 4. STORED PROCEDURES & TRIGGERS
-- =====================================================================

DELIMITER //

-- 4.1 SLA Auto-Escalation Procedure
CREATE PROCEDURE escalate_overdue_complaints(OUT affected_count INT)
BEGIN
  UPDATE complaint c
  JOIN category cat ON cat.category_id = c.category_id
  SET c.status = 'Escalated',
      c.updated_at = NOW()
  WHERE c.status IN ('Open', 'Assigned', 'In-Progress')
    AND NOW() > DATE_ADD(c.created_at, INTERVAL cat.sla_days DAY);

  SET affected_count = ROW_COUNT();
END //

-- 4.2 Auto-log new complaint insertion to status_history
CREATE TRIGGER trg_complaint_status_insert
AFTER INSERT ON complaint
FOR EACH ROW
BEGIN
  INSERT INTO status_history (complaint_id, history_num, old_status, new_status, changed_at, changed_by, note)
  VALUES (NEW.complaint_id, 1, NULL, NEW.status, NEW.created_at, 'Student', 'Complaint filed');
END //

-- 4.3 Auto-log status transitions to status_history
CREATE TRIGGER trg_complaint_status_update
AFTER UPDATE ON complaint
FOR EACH ROW
BEGIN
  DECLARE next_num SMALLINT UNSIGNED;
  IF OLD.status != NEW.status THEN
    SELECT COALESCE(MAX(history_num), 0) + 1 INTO next_num
    FROM status_history
    WHERE complaint_id = NEW.complaint_id;

    INSERT INTO status_history (complaint_id, history_num, old_status, new_status, changed_at, changed_by, note)
    VALUES (NEW.complaint_id, next_num, OLD.status, NEW.status, NOW(), 'Maintenance System', CONCAT('Status changed to ', NEW.status));
  END IF;
END //

-- 4.4 Transition Open complaint to Assigned on staff assignment
CREATE TRIGGER trg_assignment_sets_status
AFTER INSERT ON staff_assignment
FOR EACH ROW
BEGIN
  UPDATE complaint
  SET status = 'Assigned'
  WHERE complaint_id = NEW.complaint_id
    AND status = 'Open';
END //

DELIMITER ;

-- =====================================================================
-- 5. SEED DATA
-- =====================================================================

-- 5.1 Departments
INSERT INTO department (dept_id, dept_name, dept_head) VALUES
  (1, 'Estate & Maintenance', 'Dr. Ramesh Naik'),
  (2, 'IT Services',          'Prof. Anita Desai'),
  (3, 'Hostel Office',        'Dr. Suresh Kamat'),
  (4, 'Mess & Catering',      'Mr. Vinay Prabhu'),
  (5, 'Academic Office',      'Dr. Meera Kulkarni');

-- 5.2 Staff (Password: admin123)
INSERT INTO staff (staff_id, first_name, last_name, designation, email, dept_id, password_hash) VALUES
  (1, 'Rajesh',  'Gawas',     'Admin',                'rajesh.gawas@campus.edu',     5, '$2b$10$AfRP2AtzbwtZvI7n0hXJDuuL0iX17PfYqQ1jdumOHiVylpvHxUWvy'),
  (2, 'Sunita',  'Borkar',    'Hostel Warden',        'sunita.borkar@campus.edu',    3, '$2b$10$AfRP2AtzbwtZvI7n0hXJDuuL0iX17PfYqQ1jdumOHiVylpvHxUWvy'),
  (3, 'Prakash', 'Fernandes', 'Hostel Warden',        'prakash.fernandes@campus.edu',3, '$2b$10$AfRP2AtzbwtZvI7n0hXJDuuL0iX17PfYqQ1jdumOHiVylpvHxUWvy'),
  (4, 'Kavita',  'Shetty',    'Hostel Warden',        'kavita.shetty@campus.edu',    3, '$2b$10$AfRP2AtzbwtZvI7n0hXJDuuL0iX17PfYqQ1jdumOHiVylpvHxUWvy'),
  (5, 'Anil',    'Pai',       'Electrician',          'anil.pai@campus.edu',         1, '$2b$10$AfRP2AtzbwtZvI7n0hXJDuuL0iX17PfYqQ1jdumOHiVylpvHxUWvy'),
  (6, 'Joseph',  'Dias',      'Plumber',              'joseph.dias@campus.edu',      1, '$2b$10$AfRP2AtzbwtZvI7n0hXJDuuL0iX17PfYqQ1jdumOHiVylpvHxUWvy'),
  (7, 'Neha',    'Kamat',     'Network Engineer',     'neha.kamat@campus.edu',       2, '$2b$10$AfRP2AtzbwtZvI7n0hXJDuuL0iX17PfYqQ1jdumOHiVylpvHxUWvy'),
  (8, 'Mahesh',  'Naik',      'Mess Supervisor',      'mahesh.naik@campus.edu',      4, '$2b$10$AfRP2AtzbwtZvI7n0hXJDuuL0iX17PfYqQ1jdumOHiVylpvHxUWvy'),
  (9, 'Pooja',   'Sawant',    'Academic Coordinator', 'pooja.sawant@campus.edu',     5, '$2b$10$AfRP2AtzbwtZvI7n0hXJDuuL0iX17PfYqQ1jdumOHiVylpvHxUWvy');

-- 5.3 Hostels
INSERT INTO hostel (hostel_id, hostel_name, warden_id) VALUES
  (1, 'Mandovi Boys Hostel', 2),
  (2, 'Zuari Boys Hostel',   3),
  (3, 'Chapora Girls Hostel', 4);

-- 5.4 Students (Password: password123)
INSERT INTO student (student_id, first_name, last_name, email, room_no, hostel_id, password_hash) VALUES
  (1,  'Raksham',   'Dessai',    'raksham.dessai@campus.edu',   'A-204', 1, '$2b$10$LUr44rGHiLZeNlPrDEYSoOqb2e96r6e/q2caump2syFYD5OVgmLyC'),
  (2,  'Aarav',     'Naik',      'aarav.naik@campus.edu',       'A-110', 1, '$2b$10$LUr44rGHiLZeNlPrDEYSoOqb2e96r6e/q2caump2syFYD5OVgmLyC'),
  (3,  'Rohan',     'Fernandes', 'rohan.fernandes@campus.edu',  'B-305', 2, '$2b$10$LUr44rGHiLZeNlPrDEYSoOqb2e96r6e/q2caump2syFYD5OVgmLyC'),
  (4,  'Siddharth', 'Kamat',     'siddharth.kamat@campus.edu',  'B-112', 2, '$2b$10$LUr44rGHiLZeNlPrDEYSoOqb2e96r6e/q2caump2syFYD5OVgmLyC'),
  (5,  'Ananya',    'Prabhu',    'ananya.prabhu@campus.edu',    'C-101', 3, '$2b$10$LUr44rGHiLZeNlPrDEYSoOqb2e96r6e/q2caump2syFYD5OVgmLyC'),
  (6,  'Diya',      'Shetty',    'diya.shetty@campus.edu',      'C-214', 3, '$2b$10$LUr44rGHiLZeNlPrDEYSoOqb2e96r6e/q2caump2syFYD5OVgmLyC'),
  (7,  'Karan',     'Gawas',     'karan.gawas@campus.edu',      'A-312', 1, '$2b$10$LUr44rGHiLZeNlPrDEYSoOqb2e96r6e/q2caump2syFYD5OVgmLyC'),
  (8,  'Meghna',    'Sawant',    'meghna.sawant@campus.edu',    'C-307', 3, '$2b$10$LUr44rGHiLZeNlPrDEYSoOqb2e96r6e/q2caump2syFYD5OVgmLyC'),
  (9,  'Neil',      'Pereira',   'neil.pereira@campus.edu',     'B-208', 2, '$2b$10$LUr44rGHiLZeNlPrDEYSoOqb2e96r6e/q2caump2syFYD5OVgmLyC'),
  (10, 'Isha',      'Borkar',    'isha.borkar@campus.edu',      'C-120', 3, '$2b$10$LUr44rGHiLZeNlPrDEYSoOqb2e96r6e/q2caump2syFYD5OVgmLyC');

-- 5.5 Student Phone Numbers
INSERT INTO student_phone (student_id, phone_number) VALUES
  (1, '9876500001'), (1, '9876500011'),
  (2, '9876500002'),
  (3, '9876500003'), (3, '9876500033'),
  (4, '9876500004'),
  (5, '9876500005'),
  (6, '9876500006'),
  (7, '9876500007'),
  (8, '9876500008'),
  (9, '9876500009'),
  (10, '9876500010');

-- 5.6 Categories
INSERT INTO category (category_id, category_name, sla_days, dept_id) VALUES
  (1, 'Electrical',            2, 1),
  (2, 'Plumbing',              2, 1),
  (3, 'Furniture & Civil',     5, 1),
  (4, 'Internet / Wi-Fi',      1, 2),
  (5, 'Mess / Food Quality',   3, 4),
  (6, 'Room Allotment',        7, 3),
  (7, 'Academic / Timetable',  7, 5),
  (8, 'Cleanliness & Hygiene', 2, 3);

-- 5.7 Complaints
INSERT INTO complaint (complaint_id, description, status, created_at, updated_at, student_id, category_id) VALUES
  (1,  'Ceiling fan in room A-204 has stopped working completely.', 'Resolved',    NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 8 DAY,  1, 1),
  (2,  'Wi-Fi is extremely slow in Mandovi hostel after 9 PM every night.', 'In-Progress', NOW() - INTERVAL 4 DAY,  NOW() - INTERVAL 2 DAY,  2, 4),
  (3,  'Water leaking continuously from the bathroom tap in room B-305.', 'Assigned',    NOW() - INTERVAL 1 DAY,  NOW() - INTERVAL 20 HOUR, 3, 2),
  (4,  'Rice served at dinner was undercooked for the third day in a row.', 'Open',        NOW() - INTERVAL 6 HOUR, NOW() - INTERVAL 6 HOUR,  4, 5),
  (5,  'Common bathroom on the first floor of Chapora has not been cleaned for two days.', 'Escalated',   NOW() - INTERVAL 5 DAY,  NOW() - INTERVAL 1 DAY,   5, 8),
  (6,  'Tube light in the corridor near room C-214 keeps flickering at night.', 'Open',        NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 2 HOUR,  6, 1),
  (7,  'Study table drawer in room A-312 is broken and does not close.', 'In-Progress', NOW() - INTERVAL 6 DAY,  NOW() - INTERVAL 3 DAY,   7, 3),
  (8,  'Requesting a room change because of constant noise from the adjacent mess area.', 'Resolved',    NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 8 DAY,  8, 6),
  (9,  'No Wi-Fi signal at all on the second floor of Zuari hostel.', 'Escalated',   NOW() - INTERVAL 6 DAY,  NOW() - INTERVAL 4 DAY,   9, 4),
  (10, 'Timetable clash between Elective II and the lab session on Thursdays.', 'Assigned',    NOW() - INTERVAL 2 DAY,  NOW() - INTERVAL 1 DAY,   10, 7),
  (11, 'Tea served in the mess is served cold every single morning.', 'Resolved',    NOW() - INTERVAL 7 DAY,  NOW() - INTERVAL 5 DAY,   1, 5),
  (12, 'Garbage has not been collected from Zuari hostel block B since yesterday.', 'Open',        NOW() - INTERVAL 30 HOUR, NOW() - INTERVAL 30 HOUR, 3, 8),
  (13, 'Hot water geyser in Mandovi hostel is not heating at all.', 'In-Progress', NOW() - INTERVAL 3 DAY,  NOW() - INTERVAL 1 DAY,   2, 2),
  (14, 'Hostel Wi-Fi password needs to be reset for room C-101.', 'Resolved',    NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 19 DAY,  5, 4);

-- 5.8 Status History
INSERT INTO status_history (complaint_id, history_num, old_status, new_status, changed_at, changed_by, note) VALUES
  (1, 1, NULL,          'Open',        NOW() - INTERVAL 10 DAY, 'Student', 'Lodge ticket'),
  (1, 2, 'Open',        'Assigned',    NOW() - INTERVAL 9 DAY,  'Warden',  'Assigned to Anil Pai'),
  (1, 3, 'Assigned',    'In-Progress', NOW() - INTERVAL 9 DAY,  'Staff',   'Replacing capacitor'),
  (1, 4, 'In-Progress', 'Resolved',    NOW() - INTERVAL 8 DAY,  'Staff',   'Capacitor replaced; fan working'),

  (2, 1, NULL,          'Open',        NOW() - INTERVAL 4 DAY,  'Student', 'Lodge ticket'),
  (2, 2, 'Open',        'Assigned',    NOW() - INTERVAL 3 DAY,  'Warden',  'Assigned to Neha Kamat'),
  (2, 3, 'Assigned',    'In-Progress', NOW() - INTERVAL 2 DAY,  'Staff',   'Investigating router switch bandwidth'),

  (3, 1, NULL,          'Open',        NOW() - INTERVAL 1 DAY,  'Student', 'Lodge ticket'),
  (3, 2, 'Open',        'Assigned',    NOW() - INTERVAL 20 HOUR,'Warden',  'Assigned to Joseph Dias'),

  (4, 1, NULL,          'Open',        NOW() - INTERVAL 6 HOUR, 'Student', 'Lodge ticket'),

  (5, 1, NULL,          'Open',        NOW() - INTERVAL 5 DAY,  'Student', 'Lodge ticket'),
  (5, 2, 'Open',        'Assigned',    NOW() - INTERVAL 4 DAY,  'Warden',  'Assigned to cleaning staff'),
  (5, 3, 'Assigned',    'Escalated',   NOW() - INTERVAL 1 DAY,  'System',  'Auto-escalated: SLA exceeded'),

  (6, 1, NULL,          'Open',        NOW() - INTERVAL 2 HOUR, 'Student', 'Lodge ticket'),

  (7, 1, NULL,          'Open',        NOW() - INTERVAL 6 DAY,  'Student', 'Lodge ticket'),
  (7, 2, 'Open',        'Assigned',    NOW() - INTERVAL 5 DAY,  'Warden',  'Assigned to carpenter'),
  (7, 3, 'Assigned',    'In-Progress', NOW() - INTERVAL 3 DAY,  'Staff',   'Repairing slider track'),

  (8, 1, NULL,          'Open',        NOW() - INTERVAL 15 DAY, 'Student', 'Lodge ticket'),
  (8, 2, 'Open',        'Assigned',    NOW() - INTERVAL 14 DAY, 'Warden',  'Reviewing room vacancy'),
  (8, 3, 'Assigned',    'In-Progress', NOW() - INTERVAL 12 DAY, 'Staff',   'Reallotment in progress'),
  (8, 4, 'In-Progress', 'Resolved',    NOW() - INTERVAL 8 DAY,  'Warden',  'Allocated room C-308'),

  (9, 1, NULL,          'Open',        NOW() - INTERVAL 6 DAY,  'Student', 'Lodge ticket'),
  (9, 2, 'Open',        'Assigned',    NOW() - INTERVAL 5 DAY,  'Warden',  'Assigned to IT team'),
  (9, 3, 'Assigned',    'Escalated',   NOW() - INTERVAL 4 DAY,  'System',  'Auto-escalated: SLA exceeded'),

  (10, 1, NULL,         'Open',        NOW() - INTERVAL 2 DAY,  'Student', 'Lodge ticket'),
  (10, 2, 'Open',       'Assigned',    NOW() - INTERVAL 1 DAY,  'Warden',  'Forwarded to Academic Coordinator'),

  (11, 1, NULL,         'Open',        NOW() - INTERVAL 7 DAY,  'Student', 'Lodge ticket'),
  (11, 2, 'Open',       'Assigned',    NOW() - INTERVAL 6 DAY,  'Warden',  'Mess supervisor notified'),
  (11, 3, 'Assigned',   'Resolved',    NOW() - INTERVAL 5 DAY,  'Staff',   'Hot urn thermal switch repaired'),

  (12, 1, NULL,         'Open',        NOW() - INTERVAL 30 HOUR,'Student', 'Lodge ticket'),

  (13, 1, NULL,         'Open',        NOW() - INTERVAL 3 DAY,  'Student', 'Lodge ticket'),
  (13, 2, 'Open',       'Assigned',    NOW() - INTERVAL 2 DAY,  'Warden',  'Assigned to Joseph Dias'),
  (13, 3, 'Assigned',   'In-Progress', NOW() - INTERVAL 1 DAY,  'Staff',   'Testing electrical thermostat'),

  (14, 1, NULL,         'Open',        NOW() - INTERVAL 20 DAY, 'Student', 'Lodge ticket'),
  (14, 2, 'Open',       'Assigned',    NOW() - INTERVAL 19 DAY, 'Warden',  'Network team notified'),
  (14, 3, 'Assigned',   'Resolved',    NOW() - INTERVAL 19 DAY, 'Staff',   'Credentials regenerated and verified');

-- 5.9 Staff Assignments
INSERT INTO staff_assignment (staff_id, complaint_id, assigned_at, unassigned_at) VALUES
  (5, 1,  NOW() - INTERVAL 9 DAY,  NOW() - INTERVAL 8 DAY),
  (7, 2,  NOW() - INTERVAL 3 DAY,  NULL),
  (6, 3,  NOW() - INTERVAL 20 HOUR,NULL),
  (4, 5,  NOW() - INTERVAL 4 DAY,  NULL),
  (5, 7,  NOW() - INTERVAL 5 DAY,  NULL),
  (4, 8,  NOW() - INTERVAL 14 DAY, NOW() - INTERVAL 8 DAY),
  (7, 9,  NOW() - INTERVAL 5 DAY,  NOW() - INTERVAL 3 DAY),
  (1, 9,  NOW() - INTERVAL 3 DAY,  NULL),
  (9, 10, NOW() - INTERVAL 1 DAY,  NULL),
  (8, 11, NOW() - INTERVAL 6 DAY,  NOW() - INTERVAL 5 DAY),
  (6, 13, NOW() - INTERVAL 2 DAY,  NULL),
  (7, 14, NOW() - INTERVAL 19 DAY, NOW() - INTERVAL 19 DAY);

-- 5.10 Student Feedback
INSERT INTO feedback (complaint_id, student_id, rating, comments, submitted_at) VALUES
  (1,  1, 5, 'Quick response! Electrician replaced the capacitor on the same day.', NOW() - INTERVAL 7 DAY),
  (8,  8, 4, 'Room allotment issue resolved smoothly by the warden.',               NOW() - INTERVAL 7 DAY),
  (11, 1, 4, 'Mess tea temperature improved significantly.',                        NOW() - INTERVAL 4 DAY),
  (14, 5, 5, 'Wi-Fi credentials reset within 30 minutes.',                          NOW() - INTERVAL 18 DAY);
