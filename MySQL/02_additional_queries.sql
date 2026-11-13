-- ===================================================================
-- Campus Complaint Tracker — Additional SQL Queries & DDL
-- File: 02_additional_queries.sql
-- Database: PostgreSQL 15 (Supabase)
-- 
-- This file documents supplementary DDL and DML queries NOT covered
-- in 01_schema_and_seed.sql. Each section includes a comment header
-- explaining:
--   • What the query does
--   • Which DBMS concept it demonstrates
--   • When it is called in the application
-- ===================================================================


-- ===================================================================
-- SECTION 1: FEEDBACK TABLE DDL
-- ===================================================================
-- What: Stores student satisfaction ratings and comments after a
--       complaint is resolved.
-- DBMS Concept: Referential Integrity (FK to complaint), CHECK
--               constraint for rating domain, ON DELETE CASCADE.
-- When called: After complaint status transitions to 'Resolved',
--              student sees a feedback form; INSERT fires here.
-- ===================================================================

CREATE TABLE IF NOT EXISTS feedback (
    feedback_id     SERIAL          PRIMARY KEY,
    complaint_id    INT             NOT NULL,
    student_id      INT             NOT NULL,
    rating          SMALLINT        NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    submitted_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_feedback_complaint
        FOREIGN KEY (complaint_id)
        REFERENCES complaint(complaint_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_feedback_student
        FOREIGN KEY (student_id)
        REFERENCES student(student_id)
        ON DELETE CASCADE,

    -- One feedback per resolved complaint per student
    CONSTRAINT uq_feedback_complaint_student
        UNIQUE (complaint_id, student_id)
);

-- Index for quick lookup of feedback by complaint
CREATE INDEX IF NOT EXISTS idx_feedback_complaint_id
    ON feedback(complaint_id);

-- RLS: Students can only insert/view their own feedback
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students insert own feedback"
    ON feedback FOR INSERT
    WITH CHECK (student_id = current_student_id());

CREATE POLICY "Students view own feedback"
    ON feedback FOR SELECT
    USING (student_id = current_student_id() OR is_admin());


-- ===================================================================
-- SECTION 2: NOTIFICATION TABLE DDL
-- ===================================================================
-- What: Stores in-app notifications sent to students/staff when a
--       complaint status changes or SLA is breached.
-- DBMS Concept: Weak-entity-style audit trail; triggered by DB
--               triggers (TRG_NOTIFY_STATUS_CHANGE). Boolean flag
--               for read/unread state.
-- When called: Inserted by trigger on complaint UPDATE; read by
--              getNotifications() in src/lib/db.js on page load.
-- ===================================================================

CREATE TABLE IF NOT EXISTS notification (
    notification_id SERIAL          PRIMARY KEY,
    user_email      TEXT            NOT NULL,   -- matches auth.users.email
    title           TEXT            NOT NULL,
    body            TEXT            NOT NULL,
    complaint_id    INT,                        -- nullable (system notifications)
    is_read         BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_notification_complaint
        FOREIGN KEY (complaint_id)
        REFERENCES complaint(complaint_id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_notification_user_email
    ON notification(user_email, is_read);

-- RLS: Users see only their own notifications
ALTER TABLE notification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
    ON notification FOR SELECT
    USING (user_email = auth.email());

CREATE POLICY "System/admin insert notifications"
    ON notification FOR INSERT
    WITH CHECK (is_admin());


-- ===================================================================
-- SECTION 3: MONTHLY TREND ANALYTICS QUERY
-- ===================================================================
-- What: Aggregates total complaints filed, resolved, and escalated
--       per calendar month for the last 6 months. Used to populate
--       the AreaChart in AdminAnalytics.jsx.
-- DBMS Concept: Aggregate functions (COUNT), GROUP BY with
--               DATE_TRUNC (PostgreSQL date truncation), conditional
--               aggregation with FILTER clause.
-- When called: getAnalytics() → analytics.monthlyTrend in
--              AdminAnalytics.jsx on component mount.
-- ===================================================================

SELECT
    TO_CHAR(DATE_TRUNC('month', filed_at), 'Mon') AS month,
    DATE_TRUNC('month', filed_at)                 AS month_start,
    COUNT(*)                                       AS filed,
    COUNT(*) FILTER (WHERE status = 'Resolved')   AS resolved,
    COUNT(*) FILTER (WHERE is_escalated = TRUE
                     OR status = 'Escalated')      AS breached
FROM
    complaint
WHERE
    filed_at >= DATE_TRUNC('month', NOW()) - INTERVAL '5 months'
GROUP BY
    DATE_TRUNC('month', filed_at)
ORDER BY
    month_start ASC;


-- ===================================================================
-- SECTION 4: SLA COMPLIANCE PERCENTAGE QUERY PER CATEGORY
-- ===================================================================
-- What: Computes what percentage of complaints in each category were
--       resolved within the configured SLA window (sla_days). Also
--       computes average actual resolution time in hours.
-- DBMS Concept: JOIN (complaint ⟶ category), aggregate with FILTER,
--               EXTRACT for interval arithmetic, derived attribute
--               (compliance_pct is computed, not stored).
-- When called: getAnalytics() → analytics.slaCompliance in
--              AdminAnalytics.jsx for the SLA bar chart.
-- ===================================================================

SELECT
    cat.category_id,
    cat.category_name,
    cat.sla_days,
    COUNT(c.complaint_id)                                       AS total,
    COUNT(c.complaint_id) FILTER (
        WHERE c.status = 'Resolved'
          AND EXTRACT(EPOCH FROM (c.resolved_at - c.filed_at)) / 3600
              <= (cat.sla_days * 24)
    )                                                           AS resolved_in_sla,
    ROUND(
        100.0 * COUNT(c.complaint_id) FILTER (
            WHERE c.status = 'Resolved'
              AND EXTRACT(EPOCH FROM (c.resolved_at - c.filed_at)) / 3600
                  <= (cat.sla_days * 24)
        ) / NULLIF(COUNT(c.complaint_id), 0),
        1
    )                                                           AS compliance_pct,
    ROUND(
        AVG(
            CASE WHEN c.status = 'Resolved' AND c.resolved_at IS NOT NULL
                 THEN EXTRACT(EPOCH FROM (c.resolved_at - c.filed_at)) / 3600
            END
        )::NUMERIC,
        1
    )                                                           AS avg_resolution_hours
FROM
    category cat
LEFT JOIN
    complaint c ON c.category_id = cat.category_id
GROUP BY
    cat.category_id, cat.category_name, cat.sla_days
ORDER BY
    compliance_pct ASC NULLS LAST;


-- ===================================================================
-- SECTION 5: STUDENT TOTAL COMPLAINTS — DERIVED ATTRIBUTE QUERY
-- ===================================================================
-- What: Computes total_complaints_filed as a derived attribute for
--       each student — this value is NOT stored in the student table
--       but derived on-the-fly (or via a view/trigger).
-- DBMS Concept: Derived attribute (3NF — not stored to avoid update
--               anomalies), aggregate sub-query / window function.
-- When called: getStudentSummary(studentId) in src/lib/db.js when a
--              student views their profile dashboard.
-- ===================================================================

-- Option A: Inline derived attribute for a single student
SELECT
    s.student_id,
    s.first_name,
    s.last_name,
    s.email,
    s.room_no,
    h.hostel_name,
    COUNT(c.complaint_id)                                           AS total_complaints_filed,
    COUNT(c.complaint_id) FILTER (WHERE c.status = 'Resolved')     AS total_resolved,
    COUNT(c.complaint_id) FILTER (WHERE c.status = 'Open')         AS total_open,
    COUNT(c.complaint_id) FILTER (WHERE c.is_escalated = TRUE)     AS total_escalated
FROM
    student s
LEFT JOIN hostel h ON h.hostel_id = s.hostel_id
LEFT JOIN complaint c ON c.student_id = s.student_id
WHERE
    s.student_id = :student_id   -- parameter from application layer
GROUP BY
    s.student_id, s.first_name, s.last_name, s.email, s.room_no, h.hostel_name;

-- Option B: Materialized as a view (v_student_summary — used in RLS)
CREATE OR REPLACE VIEW v_student_summary AS
SELECT
    s.student_id,
    s.first_name || ' ' || s.last_name AS full_name,
    s.email,
    s.room_no,
    h.hostel_name,
    COUNT(c.complaint_id)                                           AS total_complaints_filed,
    COUNT(c.complaint_id) FILTER (WHERE c.status = 'Resolved')     AS total_resolved,
    COUNT(c.complaint_id) FILTER (WHERE c.status = 'Open')         AS total_open
FROM
    student s
LEFT JOIN hostel h ON h.hostel_id = s.hostel_id
LEFT JOIN complaint c ON c.student_id = s.student_id
GROUP BY
    s.student_id, s.first_name, s.last_name, s.email, s.room_no, h.hostel_name;


-- ===================================================================
-- SECTION 6: HOTSPOT ANALYSIS — MOST COMPLAINED LOCATIONS/CATEGORIES
-- ===================================================================
-- What: Identifies the top 10 complaint hotspots (category + hostel
--       combination) in the last 30 days. Useful for admin to
--       proactively allocate maintenance resources.
-- DBMS Concept: Multi-table JOIN (complaint → category → hostel),
--               time-windowed aggregation with ORDER BY + LIMIT,
--               demonstrates ad-hoc analytical SQL.
-- When called: Admin analytics dashboard (future hotspot widget),
--              or exported CSV report.
-- ===================================================================

SELECT
    cat.category_name,
    h.hostel_name,
    COUNT(c.complaint_id)                                        AS complaint_count,
    COUNT(c.complaint_id) FILTER (WHERE c.status = 'Resolved')  AS resolved_count,
    COUNT(c.complaint_id) FILTER (WHERE c.is_escalated = TRUE)  AS escalated_count,
    ROUND(
        100.0 * COUNT(c.complaint_id) FILTER (WHERE c.is_escalated = TRUE)
        / NULLIF(COUNT(c.complaint_id), 0),
        1
    )                                                            AS escalation_rate_pct
FROM
    complaint c
JOIN  category cat ON cat.category_id = c.category_id
JOIN  student  s   ON s.student_id    = c.student_id
JOIN  hostel   h   ON h.hostel_id     = s.hostel_id
WHERE
    c.filed_at >= NOW() - INTERVAL '30 days'
GROUP BY
    cat.category_name, h.hostel_name
ORDER BY
    complaint_count DESC,
    escalation_rate_pct DESC
LIMIT 10;


-- ===================================================================
-- SECTION 7: STAFF PERFORMANCE RANKING
-- ===================================================================
-- What: Ranks all maintenance staff by average resolution time (hours)
--       and total complaints resolved in the current semester.
--       Used in the AdminAnalytics staff performance table.
-- DBMS Concept: Multi-join, conditional aggregate, RANK() window
--               function, NULLs handled with COALESCE.
-- When called: getAnalytics() → analytics.staffPerformance, rendered
--              in AdminAnalytics.jsx (future staff leaderboard table).
-- ===================================================================

SELECT
    st.staff_id,
    st.first_name || ' ' || st.last_name           AS staff_name,
    st.designation,
    d.dept_name,
    COUNT(DISTINCT sa.complaint_id)                 AS total_assigned,
    COUNT(DISTINCT c.complaint_id)
        FILTER (WHERE c.status = 'Resolved')        AS total_resolved,
    ROUND(
        AVG(
            CASE WHEN c.status = 'Resolved' AND c.resolved_at IS NOT NULL
                 THEN EXTRACT(EPOCH FROM (c.resolved_at - sa.assigned_at)) / 3600
            END
        )::NUMERIC,
        1
    )                                               AS avg_resolution_hours,
    RANK() OVER (
        ORDER BY
            COUNT(DISTINCT c.complaint_id) FILTER (WHERE c.status = 'Resolved') DESC,
            AVG(EXTRACT(EPOCH FROM (c.resolved_at - sa.assigned_at))) ASC NULLS LAST
    )                                               AS performance_rank
FROM
    staff st
JOIN  department      d  ON d.dept_id    = st.dept_id
LEFT JOIN staff_assignment sa ON sa.staff_id = st.staff_id
                              AND sa.unassigned_at IS NULL
LEFT JOIN complaint       c  ON c.complaint_id = sa.complaint_id
WHERE
    sa.assigned_at >= DATE_TRUNC('month', NOW()) - INTERVAL '5 months'
    OR sa.assigned_at IS NULL
GROUP BY
    st.staff_id, st.first_name, st.last_name, st.designation, d.dept_name
ORDER BY
    performance_rank ASC;


-- ===================================================================
-- SECTION 8: DEPARTMENT WORKLOAD SUMMARY
-- ===================================================================
-- What: Provides a per-department summary of open vs resolved
--       complaints and the number of active staff members.
--       Feeds the AdminDashboard department cards.
-- DBMS Concept: GROUP BY with multi-table JOIN (department → category
--               → complaint), aggregate functions, outer join to
--               include departments with zero complaints.
-- When called: getDashboardStats() in src/lib/db.js on AdminDashboard
--              mount.
-- ===================================================================

SELECT
    d.dept_id,
    d.dept_name,
    d.dept_head,
    COUNT(DISTINCT st.staff_id)                                      AS staff_count,
    COUNT(DISTINCT c.complaint_id)                                   AS total_complaints,
    COUNT(DISTINCT c.complaint_id) FILTER (WHERE c.status = 'Open') AS open_complaints,
    COUNT(DISTINCT c.complaint_id)
        FILTER (WHERE c.status = 'In-Progress')                      AS in_progress_complaints,
    COUNT(DISTINCT c.complaint_id)
        FILTER (WHERE c.status = 'Resolved')                         AS resolved_complaints,
    COUNT(DISTINCT c.complaint_id)
        FILTER (WHERE c.is_escalated = TRUE)                         AS escalated_complaints
FROM
    department d
LEFT JOIN staff    st  ON st.dept_id    = d.dept_id
LEFT JOIN category cat ON cat.dept_id   = d.dept_id
LEFT JOIN complaint c  ON c.category_id = cat.category_id
GROUP BY
    d.dept_id, d.dept_name, d.dept_head
ORDER BY
    total_complaints DESC;


-- ===================================================================
-- SECTION 9: REOPEN COMPLAINT QUERY
-- ===================================================================
-- What: Allows an admin/warden to reopen a complaint that was
--       incorrectly marked Resolved. This inserts a new status_history
--       record (weak entity) and resets the status.
-- DBMS Concept: Transaction (atomic multi-statement), weak entity
--               (status_history), UPDATE with subquery for history_num.
-- When called: Future "Reopen" button on complaint detail page,
--              called via supabase.rpc('reopen_complaint', {id}).
-- ===================================================================

-- As a PostgreSQL function (callable via supabase.rpc)
CREATE OR REPLACE FUNCTION reopen_complaint(p_complaint_id INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_next_history_num INT;
BEGIN
    -- Verify complaint exists and is Resolved
    IF NOT EXISTS (
        SELECT 1 FROM complaint
        WHERE complaint_id = p_complaint_id AND status = 'Resolved'
    ) THEN
        RAISE EXCEPTION 'Complaint % is not in Resolved state', p_complaint_id;
    END IF;

    -- Compute next history_num (weak entity sequence within complaint)
    SELECT COALESCE(MAX(history_num), 0) + 1
    INTO   v_next_history_num
    FROM   status_history
    WHERE  complaint_id = p_complaint_id;

    -- Insert status_history record (weak entity — identified by composite PK)
    INSERT INTO status_history (complaint_id, history_num, old_status, new_status, changed_at, changed_by)
    VALUES (
        p_complaint_id,
        v_next_history_num,
        'Resolved',
        'Open',
        NOW(),
        auth.uid()::TEXT
    );

    -- Reset complaint status
    UPDATE complaint
    SET    status       = 'Open',
           resolved_at  = NULL,
           is_escalated = FALSE
    WHERE  complaint_id = p_complaint_id;
END;
$$;


-- ===================================================================
-- SECTION 10: WITHDRAW/DELETE COMPLAINT (ONLY IF OPEN)
-- ===================================================================
-- What: Allows a student to withdraw their own complaint, but ONLY if
--       it is still in 'Open' status (not yet assigned or in progress).
--       Demonstrates business-rule enforcement at DB level.
-- DBMS Concept: Conditional DELETE with CHECK via function; referential
--               integrity (CASCADE deletes status_history rows);
--               Row Level Security restricts to complaint owner.
-- When called: "Withdraw Complaint" button on student complaint detail
--              page (only shown when status = 'Open').
-- ===================================================================

CREATE OR REPLACE FUNCTION withdraw_complaint(p_complaint_id INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- RLS check: student must own this complaint
    IF NOT EXISTS (
        SELECT 1 FROM complaint
        WHERE  complaint_id = p_complaint_id
          AND  student_id   = current_student_id()
    ) THEN
        RAISE EXCEPTION 'Permission denied: you do not own complaint %', p_complaint_id;
    END IF;

    -- Business rule: only Open complaints can be withdrawn
    IF NOT EXISTS (
        SELECT 1 FROM complaint
        WHERE  complaint_id = p_complaint_id
          AND  status       = 'Open'
    ) THEN
        RAISE EXCEPTION 'Cannot withdraw complaint %: it is no longer Open', p_complaint_id;
    END IF;

    -- Delete (CASCADE removes status_history rows automatically)
    DELETE FROM complaint WHERE complaint_id = p_complaint_id;
END;
$$;

-- Equivalent direct DELETE (application can use this if no function is preferred)
-- DELETE FROM complaint
-- WHERE complaint_id = :complaint_id
--   AND student_id   = :student_id      -- RLS enforced
--   AND status       = 'Open';          -- Business rule guard


-- ===================================================================
-- SECTION 11: FULL-TEXT SEARCH ON COMPLAINT DESCRIPTION
-- ===================================================================
-- What: Allows admin/warden to search complaint descriptions using
--       PostgreSQL full-text search (FTS). Returns complaints ranked
--       by relevance.
-- DBMS Concept: Full-text search with tsvector/tsquery, GIN index for
--               performance, ts_rank for relevance ordering.
-- When called: Search bar on AdminDashboard or Warden queue — fires on
--              input (debounced), passes query to getAllComplaints({q}).
-- ===================================================================

-- Add a GIN index on description for fast FTS (run once during setup)
CREATE INDEX IF NOT EXISTS idx_complaint_fts
    ON complaint
    USING GIN (to_tsvector('english', COALESCE(description, '')));

-- Full-text search query (parameterized — :search_query from app)
SELECT
    c.complaint_id,
    c.description,
    c.status,
    c.filed_at,
    s.first_name || ' ' || s.last_name  AS student_name,
    cat.category_name,
    ts_rank(
        to_tsvector('english', COALESCE(c.description, '')),
        plainto_tsquery('english', :search_query)
    )                                   AS relevance_score
FROM
    complaint  c
JOIN student   s   ON s.student_id   = c.student_id
JOIN category  cat ON cat.category_id = c.category_id
WHERE
    to_tsvector('english', COALESCE(c.description, ''))
    @@ plainto_tsquery('english', :search_query)
ORDER BY
    relevance_score DESC,
    c.filed_at      DESC
LIMIT 50;


-- ===================================================================
-- SECTION 12: PAGINATION QUERY WITH OFFSET/LIMIT
-- ===================================================================
-- What: Implements cursor-style pagination for the complaint list
--       (AdminDashboard & Warden Queue). Returns one page of results
--       plus total count for page indicator.
-- DBMS Concept: OFFSET/LIMIT pagination, window function COUNT(*)
--               OVER() for total without a second query, ORDER BY
--               determinism.
-- When called: getAllComplaints({ page, pageSize }) in src/lib/db.js;
--              Supabase client uses .range(from, to) which maps to
--              OFFSET/LIMIT internally.
-- ===================================================================

-- :page_size = rows per page (e.g. 10), :offset = (page - 1) * page_size
SELECT
    c.complaint_id,
    c.description,
    c.status,
    c.is_escalated,
    c.filed_at,
    s.first_name || ' ' || s.last_name   AS student_name,
    cat.category_name,
    d.dept_name,
    COUNT(*) OVER ()                      AS total_count   -- total without extra query
FROM
    complaint  c
JOIN student   s   ON s.student_id    = c.student_id
JOIN category  cat ON cat.category_id = c.category_id
JOIN department d  ON d.dept_id       = cat.dept_id
ORDER BY
    c.filed_at DESC,
    c.complaint_id DESC   -- tie-breaker for deterministic paging
LIMIT  :page_size
OFFSET :offset;


-- ===================================================================
-- SECTION 13: AUTH HELPER FUNCTIONS
-- ===================================================================
-- What: Reusable PL/pgSQL helper functions used inside RLS policies
--       and stored functions to identify the calling user's role
--       without hitting the application layer.
-- DBMS Concept: Stored functions (SECURITY DEFINER), auth integration
--               (Supabase auth.uid()), role-based access control.
-- When called: Automatically evaluated by PostgreSQL whenever an RLS
--              policy or function references these helpers.
-- ===================================================================

-- Returns the student_id of the authenticated student (NULL if not a student)
CREATE OR REPLACE FUNCTION current_student_id()
RETURNS INT
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
    v_student_id INT;
BEGIN
    SELECT student_id INTO v_student_id
    FROM   student
    WHERE  auth_user_id = auth.uid();
    RETURN v_student_id;
END;
$$;

-- Returns the staff_id of the authenticated staff member (NULL if not staff)
CREATE OR REPLACE FUNCTION current_staff_id()
RETURNS INT
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
    v_staff_id INT;
BEGIN
    SELECT staff_id INTO v_staff_id
    FROM   staff
    WHERE  auth_user_id = auth.uid();
    RETURN v_staff_id;
END;
$$;

-- Returns TRUE if the authenticated user is an Admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM staff
        WHERE  auth_user_id = auth.uid()
          AND  designation  = 'Admin'
    );
END;
$$;


-- ===================================================================
-- SECTION 14: CAN_VIEW_COMPLAINT() — RLS HELPER FUNCTION
-- ===================================================================
-- What: Central predicate function used across all RLS SELECT policies
--       for the complaint table. Encapsulates the full access-control
--       matrix: student sees own, staff sees assigned, warden sees
--       hostel, admin sees all.
-- DBMS Concept: Row Level Security (Supabase/PostgreSQL), SECURITY
--               DEFINER function used as a policy predicate, role
--               hierarchy without application-level enforcement.
-- When called: Evaluated by PostgreSQL for every SELECT on complaint
--              table or any view that wraps it (v_complaint_details).
-- ===================================================================

CREATE OR REPLACE FUNCTION can_view_complaint(p_complaint_id INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
    v_student_id    INT;
    v_staff_id      INT;
    v_is_admin      BOOLEAN;
    v_hostel_id     INT;
BEGIN
    -- Admins can see everything
    IF is_admin() THEN RETURN TRUE; END IF;

    -- Check if caller is a student
    v_student_id := current_student_id();
    IF v_student_id IS NOT NULL THEN
        -- Students can only view their own complaints
        RETURN EXISTS (
            SELECT 1 FROM complaint
            WHERE complaint_id = p_complaint_id
              AND student_id   = v_student_id
        );
    END IF;

    -- Check if caller is staff/warden
    v_staff_id := current_staff_id();
    IF v_staff_id IS NOT NULL THEN
        -- Regular staff: only complaints assigned to them
        IF EXISTS (
            SELECT 1 FROM staff WHERE staff_id = v_staff_id AND designation NOT LIKE '%Warden%'
        ) THEN
            RETURN EXISTS (
                SELECT 1 FROM staff_assignment
                WHERE staff_id    = v_staff_id
                  AND complaint_id = p_complaint_id
                  AND unassigned_at IS NULL
            );
        END IF;

        -- Warden: all complaints from students in their hostel
        SELECT h.hostel_id INTO v_hostel_id
        FROM   staff st
        JOIN   hostel h ON h.warden_id = st.staff_id
        WHERE  st.staff_id = v_staff_id
        LIMIT  1;

        IF v_hostel_id IS NOT NULL THEN
            RETURN EXISTS (
                SELECT 1
                FROM   complaint c
                JOIN   student   s ON s.student_id = c.student_id
                WHERE  c.complaint_id = p_complaint_id
                  AND  s.hostel_id    = v_hostel_id
            );
        END IF;
    END IF;

    -- Deny by default
    RETURN FALSE;
END;
$$;

-- Apply the helper as an RLS policy on complaint table
-- (Replaces simpler per-role policies with one unified predicate)
CREATE POLICY "can_view_complaint RLS"
    ON complaint FOR SELECT
    USING (can_view_complaint(complaint_id));
