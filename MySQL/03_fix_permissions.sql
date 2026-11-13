-- ============================================================
-- RUN THIS IN SUPABASE SQL EDITOR (Dashboard → SQL Editor → New Query)
-- This fixes all permission errors and adds password support
-- ============================================================

-- 1. Add password_hash column to student table
ALTER TABLE public.student ADD COLUMN IF NOT EXISTS password_hash text;

-- 2. Add password_hash column to staff table  
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS password_hash text;

-- 3. Grant SELECT on views to anon role (backend uses anon key)
GRANT SELECT ON public.v_complaint_details TO anon;
GRANT SELECT ON public.v_staff_workload TO anon;
GRANT SELECT ON public.v_student_summary TO anon;

-- 4. Grant SELECT/INSERT/UPDATE on all tables to anon
GRANT SELECT, INSERT, UPDATE ON public.complaint TO anon;
GRANT SELECT ON public.status_history TO anon;
GRANT INSERT ON public.status_history TO anon;
GRANT SELECT, INSERT, UPDATE ON public.staff_assignment TO anon;
GRANT SELECT, UPDATE ON public.student TO anon;
GRANT SELECT ON public.staff TO anon;
GRANT SELECT ON public.hostel TO anon;
GRANT SELECT ON public.department TO anon;
GRANT SELECT, UPDATE ON public.category TO anon;
GRANT SELECT ON public.notification TO anon;
GRANT UPDATE ON public.notification TO anon;

-- 5. Disable RLS on all tables (backend handles auth via JWT - no need for row-level security)
ALTER TABLE public.complaint DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_assignment DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.department DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.category DISABLE ROW LEVEL SECURITY;

-- 6. Grant usage on sequence (for auto-increment IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 7. Verify everything works
SELECT 'Setup complete! All permissions granted.' AS status;

