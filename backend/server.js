const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'campus_complaint_jwt_super_secret_key_2026';

app.use(cors());
app.use(express.json());

// ─── Supabase Admin Client (uses service_role key or anon key) ───────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// ─── SQL Logger for DBMS demo ─────────────────────────────────────────────
function logQuery(title, sql, params = []) {
  console.log(`\n========== [DBMS SQL] ${title} ==========`);
  console.log(sql.trim());
  if (params.length > 0) console.log('Params:', params);
  console.log(`=`.repeat(50) + '\n');
}

// ─── JWT Middleware ───────────────────────────────────────────────────────
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No authentication token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. HEALTH CHECK
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. LOOKUP DATA (Hostel, Category, Department, Staff)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/lookups', async (req, res) => {
  const sql = `
    SELECT * FROM hostel ORDER BY hostel_name;
    SELECT c.*, d.dept_name FROM category c JOIN department d ON d.dept_id = c.dept_id ORDER BY c.category_name;
    SELECT * FROM department ORDER BY dept_name;
    SELECT s.staff_id, s.first_name, s.last_name, s.designation, s.email, d.dept_id, d.dept_name
      FROM staff s LEFT JOIN department d ON d.dept_id = s.dept_id ORDER BY s.last_name;
  `;
  logQuery('GET_LOOKUPS', sql);
  try {
    const [hostelsRes, categoriesRes, departmentsRes, staffRes] = await Promise.all([
      supabase.from('hostel').select('*').order('hostel_name'),
      supabase.from('category').select('*, department:dept_id(dept_id, dept_name)').order('category_name'),
      supabase.from('department').select('*').order('dept_name'),
      supabase.from('staff').select('staff_id, first_name, last_name, designation, email, department:dept_id(dept_id, dept_name)').order('last_name'),
    ]);
    res.json({
      hostels: hostelsRes.data || [],
      categories: categoriesRes.data || [],
      departments: departmentsRes.data || [],
      staffMembers: staffRes.data || [],
      sql,
    });
  } catch (err) {
    console.error('Lookups error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Categories only
app.get('/api/categories', async (req, res) => {
  const sql = `SELECT c.*, d.dept_name FROM category c JOIN department d ON d.dept_id = c.dept_id ORDER BY c.category_name;`;
  logQuery('GET_CATEGORIES', sql);
  try {
    const { data, error } = await supabase.from('category')
      .select('*, department:dept_id(dept_id, dept_name)')
      .order('category_name');
    if (error) throw error;
    res.json({ categories: data || [], sql });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update SLA days for a category
app.patch('/api/categories/:id/sla', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { sla_days } = req.body;
  const sql = `UPDATE category SET sla_days = $1 WHERE category_id = $2 RETURNING *;`;
  logQuery('UPDATE_CATEGORY_SLA', sql, [sla_days, id]);
  try {
    const { data, error } = await supabase.from('category')
      .update({ sla_days: parseInt(sla_days) })
      .eq('category_id', id)
      .select()
      .single();
    if (error) throw error;
    res.json({ category: data, sql });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All staff (for roster)
app.get('/api/staff', authenticateToken, async (req, res) => {
  const sql = `
    SELECT s.staff_id, s.first_name, s.last_name, s.designation, s.email,
           d.dept_id, d.dept_name,
           COUNT(sa.assignment_id) FILTER (WHERE sa.unassigned_at IS NULL) AS active_assignments
    FROM staff s
    LEFT JOIN department d ON d.dept_id = s.dept_id
    LEFT JOIN staff_assignment sa ON sa.staff_id = s.staff_id
    GROUP BY s.staff_id, d.dept_id, d.dept_name
    ORDER BY s.last_name;
  `;
  logQuery('GET_STAFF_ROSTER', sql);
  try {
    const { data, error } = await supabase.from('staff')
      .select('staff_id, first_name, last_name, designation, email, department:dept_id(dept_id, dept_name)')
      .order('last_name');
    if (error) throw error;
    res.json({ staff: data || [], sql });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. AUTH — STUDENT REGISTER
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/auth/student/register', async (req, res) => {
  const { firstName, lastName, email, roomNo, hostelId, password } = req.body;

  if (!email || !firstName || !lastName || !roomNo || !hostelId || !password) {
    return res.status(400).json({ error: 'All fields are required (name, email, room, hostel, password)' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address format' });
  }

  try {
    // Check duplicate
    const checkSql = `SELECT student_id FROM student WHERE LOWER(email) = LOWER($1);`;
    logQuery('CHECK_STUDENT_EXISTS', checkSql, [email]);
    const { data: existing } = await supabase.from('student')
      .select('student_id').ilike('email', email).maybeSingle();
    if (existing) {
      return res.status(400).json({ error: 'This email is already registered. Please sign in.' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    const insertSql = `
      INSERT INTO student (first_name, last_name, email, room_no, hostel_id, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING student_id, first_name, last_name, email, room_no, hostel_id;
    `;
    logQuery('REGISTER_STUDENT', insertSql, [firstName, lastName, email, roomNo, hostelId, '[HASHED]']);

    const { data: student, error: insertErr } = await supabase.from('student')
      .insert({ first_name: firstName, last_name: lastName, email, room_no: roomNo, hostel_id: parseInt(hostelId), password_hash })
      .select('student_id, first_name, last_name, email, room_no, hostel_id, hostel:hostel_id(hostel_id, hostel_name)')
      .single();

    if (insertErr) throw insertErr;

    const token = jwt.sign(
      { id: student.student_id, email: student.email, role: 'Student' },
      JWT_SECRET, { expiresIn: '7d' }
    );

    res.status(201).json({ message: 'Registration successful', token, profile: student, role: 'Student', sql: insertSql });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. AUTH — STUDENT LOGIN
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/auth/student/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const loginSql = `
    SELECT s.*, h.hostel_name
    FROM student s
    JOIN hostel h ON h.hostel_id = s.hostel_id
    WHERE LOWER(s.email) = LOWER($1);
  `;
  logQuery('STUDENT_LOGIN', loginSql, [email]);

  try {
    const { data: student, error } = await supabase.from('student')
      .select('*, hostel:hostel_id(hostel_id, hostel_name)')
      .ilike('email', email)
      .maybeSingle();

    if (error || !student) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Password check
    if (student.password_hash) {
      const valid = await bcrypt.compare(password, student.password_hash);
      if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
    }
    // If no password_hash set yet (old seed data), allow login (for demo/migration)

    // Strip hash from response
    const { password_hash, ...safeStudent } = student;

    const token = jwt.sign(
      { id: student.student_id, email: student.email, role: 'Student' },
      JWT_SECRET, { expiresIn: '7d' }
    );

    res.json({ token, profile: safeStudent, role: 'Student', sql: loginSql });
  } catch (err) {
    console.error('Student login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. AUTH — STAFF / ADMIN LOGIN
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/auth/staff/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const staffSql = `
    SELECT st.*, d.dept_name, h.hostel_id, h.hostel_name
    FROM staff st
    LEFT JOIN department d ON d.dept_id = st.dept_id
    LEFT JOIN hostel h ON h.warden_id = st.staff_id
    WHERE LOWER(st.email) = LOWER($1);
  `;
  logQuery('STAFF_LOGIN', staffSql, [email]);

  try {
    const { data: staff, error } = await supabase.from('staff')
      .select('*, department:dept_id(dept_id, dept_name)')
      .ilike('email', email)
      .maybeSingle();

    if (error || !staff) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Password check (if hash exists)
    if (staff.password_hash) {
      const valid = await bcrypt.compare(password, staff.password_hash);
      if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
    }
    // No hash = demo mode (seed staff have no password, default is any password accepted)

    // Check hostel warden
    const { data: hostelRow } = await supabase.from('hostel')
      .select('hostel_id, hostel_name')
      .eq('warden_id', staff.staff_id)
      .maybeSingle();

    if (hostelRow) {
      staff.hostel_id = hostelRow.hostel_id;
      staff.hostel_name = hostelRow.hostel_name;
    }

    // Derive role
    let role = 'Staff';
    if (staff.designation === 'Admin') role = 'Admin';
    else if (staff.designation && staff.designation.toLowerCase().includes('warden')) role = 'Warden';
    else if (hostelRow) role = 'Warden';

    const { password_hash, ...safeStaff } = staff;

    const token = jwt.sign(
      { id: staff.staff_id, email: staff.email, role },
      JWT_SECRET, { expiresIn: '7d' }
    );

    res.json({ token, profile: safeStaff, role, sql: staffSql });
  } catch (err) {
    console.error('Staff login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. AUTH — GET CURRENT PROFILE
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const { id, email, role } = req.user;
    if (role === 'Student') {
      const { data: student } = await supabase.from('student')
        .select('student_id, first_name, last_name, email, room_no, hostel_id, hostel:hostel_id(hostel_id, hostel_name)')
        .eq('student_id', id).single();
      const sql = `SELECT s.*, h.hostel_name FROM student s JOIN hostel h ON h.hostel_id = s.hostel_id WHERE s.student_id = ${id};`;
      return res.json({ user: student, role: 'Student', sql });
    } else {
      const { data: staff } = await supabase.from('staff')
        .select('staff_id, first_name, last_name, designation, email, department:dept_id(dept_id, dept_name)')
        .eq('staff_id', id).single();
      const { data: hostelRow } = await supabase.from('hostel')
        .select('hostel_id, hostel_name').eq('warden_id', id).maybeSingle();
      if (hostelRow && staff) {
        staff.hostel_id = hostelRow.hostel_id;
        staff.hostel_name = hostelRow.hostel_name;
      }
      const sql = `SELECT st.*, d.dept_name, h.hostel_name FROM staff st LEFT JOIN department d ON d.dept_id = st.dept_id LEFT JOIN hostel h ON h.warden_id = st.staff_id WHERE st.staff_id = ${id};`;
      return res.json({ user: staff, role, sql });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. COMPLAINTS — GET (role-filtered)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/complaints', authenticateToken, async (req, res) => {
  const { id, role } = req.user;
  let sqlText = `SELECT * FROM v_complaint_details`;

  try {
    let query = supabase.from('v_complaint_details').select('*');

    if (role === 'Student') {
      sqlText += ` WHERE student_id = ${id} ORDER BY created_at DESC;`;
      query = query.eq('student_id', id).order('created_at', { ascending: false });
    } else if (role === 'Staff') {
      sqlText = `
        SELECT vcd.* FROM v_complaint_details vcd
        JOIN staff_assignment sa ON sa.complaint_id = vcd.complaint_id
        WHERE sa.staff_id = ${id} AND sa.unassigned_at IS NULL
        ORDER BY vcd.created_at DESC;
      `;
      const { data: assignments } = await supabase.from('staff_assignment')
        .select('complaint_id').eq('staff_id', id).is('unassigned_at', null);
      const ids = (assignments || []).map(a => a.complaint_id);
      if (ids.length === 0) return res.json({ complaints: [], sql: sqlText });
      query = query.in('complaint_id', ids).order('created_at', { ascending: false });
    } else if (role === 'Warden') {
      // Get warden's hostel
      const { data: hostelRow } = await supabase.from('hostel')
        .select('hostel_id').eq('warden_id', id).maybeSingle();
      const hostelId = hostelRow?.hostel_id ?? req.query.hostelId;
      if (hostelId) {
        sqlText += ` WHERE hostel_id = ${hostelId} ORDER BY created_at DESC;`;
        query = query.eq('hostel_id', hostelId).order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
        sqlText += ` ORDER BY created_at DESC;`;
      }
    } else {
      sqlText += ` ORDER BY created_at DESC;`;
      query = query.order('created_at', { ascending: false });
    }

    logQuery('GET_COMPLAINTS', sqlText);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ complaints: data || [], sql: sqlText });
  } catch (err) {
    console.error('Fetch complaints error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. COMPLAINTS — FILE NEW
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/complaints', authenticateToken, async (req, res) => {
  const { description, categoryId } = req.body;
  const studentId = req.user.id;

  if (!description || !categoryId) {
    return res.status(400).json({ error: 'Description and category are required' });
  }

  const insertSql = `
    INSERT INTO complaint (description, student_id, category_id, status)
    VALUES ($1, $2, $3, 'Open')
    RETURNING *;
    -- Trigger 'trg_complaint_status_log' auto-inserts first row into status_history
  `;
  logQuery('FILE_COMPLAINT', insertSql, [description, studentId, categoryId]);

  try {
    const { data: newComplaint, error } = await supabase.from('complaint')
      .insert({ description, student_id: studentId, category_id: parseInt(categoryId), status: 'Open' })
      .select().single();
    if (error) throw error;
    res.status(201).json({ message: 'Complaint lodged successfully', complaint: newComplaint, sql: insertSql });
  } catch (err) {
    console.error('File complaint error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. COMPLAINTS — GET DETAIL + HISTORY
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/complaints/:id', authenticateToken, async (req, res) => {
  const complaintId = req.params.id;
  const detailSql = `SELECT * FROM v_complaint_details WHERE complaint_id = ${complaintId};`;
  const historySql = `SELECT * FROM status_history WHERE complaint_id = ${complaintId} ORDER BY history_num ASC;`;
  const assignSql = `
    SELECT sa.*, s.first_name, s.last_name, s.designation
    FROM staff_assignment sa
    JOIN staff s ON s.staff_id = sa.staff_id
    WHERE sa.complaint_id = ${complaintId};
  `;
  logQuery('GET_COMPLAINT_DETAIL_FULL', `${detailSql}\n${historySql}\n${assignSql}`);

  try {
    const [detailRes, historyRes, assignRes] = await Promise.all([
      supabase.from('v_complaint_details').select('*').eq('complaint_id', complaintId).maybeSingle(),
      supabase.from('status_history').select('*').eq('complaint_id', complaintId).order('history_num', { ascending: true }),
      supabase.from('staff_assignment')
        .select('*, staff:staff_id(staff_id, first_name, last_name, designation)')
        .eq('complaint_id', complaintId),
    ]);

    res.json({
      detail: detailRes.data,
      history: historyRes.data || [],
      assignments: assignRes.data || [],
      sql: `${detailSql}\n${historySql}`,
    });
  } catch (err) {
    console.error('Complaint detail error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. COMPLAINTS — UPDATE STATUS
// ─────────────────────────────────────────────────────────────────────────────
app.patch('/api/complaints/:id/status', authenticateToken, async (req, res) => {
  const complaintId = req.params.id;
  const { status, remarks } = req.body;

  if (!status) return res.status(400).json({ error: 'Status is required' });

  const updateSql = `
    UPDATE complaint
    SET status = '${status}', updated_at = now()
    WHERE complaint_id = ${complaintId}
    RETURNING *;
    -- Trigger trg_complaint_status_log auto-inserts new row in status_history
  `;
  logQuery('UPDATE_COMPLAINT_STATUS', updateSql);

  try {
    const { data, error } = await supabase.from('complaint')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('complaint_id', complaintId)
      .select().single();
    if (error) throw error;
    res.json({ message: 'Status updated', complaint: data, sql: updateSql });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. COMPLAINTS — ASSIGN STAFF
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/complaints/:id/assign', authenticateToken, async (req, res) => {
  const complaintId = req.params.id;
  const { staffId } = req.body;
  if (!staffId) return res.status(400).json({ error: 'staffId is required' });

  const assignSql = `
    INSERT INTO staff_assignment (staff_id, complaint_id, assigned_at)
    VALUES (${staffId}, ${complaintId}, now())
    RETURNING *;
    -- Trigger trg_assignment_sets_status sets complaint.status = 'Assigned'
  `;
  logQuery('ASSIGN_STAFF_TO_COMPLAINT', assignSql);

  try {
    const { error: assignError } = await supabase.from('staff_assignment')
      .insert({ staff_id: parseInt(staffId), complaint_id: parseInt(complaintId), assigned_at: new Date().toISOString() });
    if (assignError) throw assignError;

    // Manually update status to Assigned (in case trigger not set)
    await supabase.from('complaint')
      .update({ status: 'Assigned', updated_at: new Date().toISOString() })
      .eq('complaint_id', complaintId);

    res.json({ message: 'Staff assigned successfully', sql: assignSql });
  } catch (err) {
    console.error('Assign staff error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. COMPLAINTS — UNASSIGN STAFF
// ─────────────────────────────────────────────────────────────────────────────
app.patch('/api/complaints/:id/unassign', authenticateToken, async (req, res) => {
  const complaintId = req.params.id;
  const { staffId } = req.body;

  const sql = `
    UPDATE staff_assignment SET unassigned_at = now()
    WHERE complaint_id = ${complaintId} AND staff_id = ${staffId};
  `;
  logQuery('UNASSIGN_STAFF', sql);

  try {
    await supabase.from('staff_assignment')
      .update({ unassigned_at: new Date().toISOString() })
      .eq('complaint_id', complaintId)
      .eq('staff_id', staffId);
    res.json({ message: 'Staff unassigned', sql });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 13. STAFF ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Staff queue (active assigned complaints)
app.get('/api/staff/:staffId/queue', authenticateToken, async (req, res) => {
  const { staffId } = req.params;
  const sql = `
    SELECT sa.assignment_id, sa.assigned_at,
           c.complaint_id, c.description, c.status, c.created_at,
           cat.category_name, cat.sla_days,
           s.first_name AS student_first, s.last_name AS student_last,
           h.hostel_name, s.room_no
    FROM staff_assignment sa
    JOIN complaint c ON sa.complaint_id = c.complaint_id
    JOIN category cat ON c.category_id = cat.category_id
    JOIN student s ON c.student_id = s.student_id
    JOIN hostel h ON s.hostel_id = h.hostel_id
    WHERE sa.staff_id = ${staffId} AND sa.unassigned_at IS NULL
    ORDER BY sa.assigned_at DESC;
  `;
  logQuery('STAFF_QUEUE', sql);

  try {
    const { data: assignments } = await supabase.from('staff_assignment')
      .select('assignment_id, assigned_at, complaint_id')
      .eq('staff_id', staffId)
      .is('unassigned_at', null)
      .order('assigned_at', { ascending: false });

    if (!assignments || assignments.length === 0) {
      return res.json({ queue: [], sql });
    }

    const ids = assignments.map(a => a.complaint_id);
    const { data: complaints, error } = await supabase.from('v_complaint_details')
      .select('*').in('complaint_id', ids).order('created_at', { ascending: false });
    if (error) throw error;

    res.json({ queue: complaints || [], sql });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Staff history (resolved / closed complaints)
app.get('/api/staff/:staffId/history', authenticateToken, async (req, res) => {
  const { staffId } = req.params;
  const sql = `
    SELECT vcd.* FROM v_complaint_details vcd
    JOIN staff_assignment sa ON sa.complaint_id = vcd.complaint_id
    WHERE sa.staff_id = ${staffId}
      AND vcd.status IN ('Resolved', 'Closed')
    ORDER BY vcd.updated_at DESC;
  `;
  logQuery('STAFF_HISTORY', sql);

  try {
    const { data: assignments } = await supabase.from('staff_assignment')
      .select('complaint_id').eq('staff_id', staffId);
    const ids = (assignments || []).map(a => a.complaint_id);
    if (ids.length === 0) return res.json({ history: [], sql });

    const { data, error } = await supabase.from('v_complaint_details')
      .select('*')
      .in('complaint_id', ids)
      .in('status', ['Resolved', 'Closed'])
      .order('updated_at', { ascending: false });
    if (error) throw error;
    res.json({ history: data || [], sql });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 14. WARDEN ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Warden hostel complaints
app.get('/api/warden/:hostelId/complaints', authenticateToken, async (req, res) => {
  const { hostelId } = req.params;
  const sql = `
    SELECT * FROM v_complaint_details
    WHERE hostel_id = ${hostelId}
    ORDER BY created_at DESC;
  `;
  logQuery('WARDEN_HOSTEL_COMPLAINTS', sql);

  try {
    const { data, error } = await supabase.from('v_complaint_details')
      .select('*').eq('hostel_id', hostelId).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ complaints: data || [], sql });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Warden escalations
app.get('/api/warden/:hostelId/escalations', authenticateToken, async (req, res) => {
  const { hostelId } = req.params;
  const sql = `
    SELECT * FROM v_complaint_details
    WHERE hostel_id = ${hostelId}
      AND status = 'Escalated'
    ORDER BY created_at ASC;
  `;
  logQuery('WARDEN_ESCALATIONS', sql);

  try {
    const { data, error } = await supabase.from('v_complaint_details')
      .select('*')
      .eq('hostel_id', hostelId)
      .eq('status', 'Escalated')
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json({ escalations: data || [], sql });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 15. ANALYTICS ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Dashboard stats (counts by status)
app.get('/api/analytics/dashboard-stats', authenticateToken, async (req, res) => {
  const statsSql = `
    SELECT
      COUNT(*)                                             AS total,
      COUNT(*) FILTER (WHERE status = 'Open')             AS open_count,
      COUNT(*) FILTER (WHERE status = 'Assigned')         AS assigned_count,
      COUNT(*) FILTER (WHERE status = 'In-Progress')      AS in_progress,
      COUNT(*) FILTER (WHERE status = 'Resolved')         AS resolved,
      COUNT(*) FILTER (WHERE status = 'Escalated')        AS escalated
    FROM complaint;
  `;
  logQuery('DASHBOARD_STATS', statsSql);

  try {
    const { data: allComplaints } = await supabase.from('complaint').select('status');
    const list = allComplaints || [];
    const stats = {
      total: list.length,
      open: list.filter(c => c.status === 'Open').length,
      assigned: list.filter(c => c.status === 'Assigned').length,
      inProgress: list.filter(c => c.status === 'In-Progress' || c.status === 'In Progress').length,
      resolved: list.filter(c => c.status === 'Resolved').length,
      escalated: list.filter(c => c.status === 'Escalated').length,
    };
    res.json({ stats, sql: statsSql });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Complaints by category
app.get('/api/analytics/by-category', authenticateToken, async (req, res) => {
  const sql = `
    SELECT cat.category_name, COUNT(*) AS complaint_count
    FROM complaint c
    JOIN category cat ON c.category_id = cat.category_id
    GROUP BY cat.category_name
    ORDER BY complaint_count DESC;
  `;
  logQuery('ANALYTICS_BY_CATEGORY', sql);

  try {
    const { data, error } = await supabase.from('complaint')
      .select('category:category_id(category_name)');
    if (error) throw error;
    const counts = {};
    (data || []).forEach(r => {
      const name = r.category?.category_name || 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    });
    const result = Object.entries(counts)
      .map(([category_name, complaint_count]) => ({ category_name, complaint_count }))
      .sort((a, b) => b.complaint_count - a.complaint_count);
    res.json({ byCategory: result, sql });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Complaints by status
app.get('/api/analytics/by-status', authenticateToken, async (req, res) => {
  const sql = `
    SELECT status, COUNT(*) AS count
    FROM complaint
    GROUP BY status
    ORDER BY count DESC;
  `;
  logQuery('ANALYTICS_BY_STATUS', sql);

  try {
    const { data, error } = await supabase.from('complaint').select('status');
    if (error) throw error;
    const counts = {};
    (data || []).forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
    const result = Object.entries(counts)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
    res.json({ byStatus: result, sql });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Monthly trend
app.get('/api/analytics/monthly-trend', authenticateToken, async (req, res) => {
  const sql = `
    SELECT TO_CHAR(created_at, 'YYYY-MM') AS month, COUNT(*) AS count
    FROM complaint
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12;
  `;
  logQuery('ANALYTICS_MONTHLY_TREND', sql);

  try {
    const { data, error } = await supabase.from('complaint').select('created_at');
    if (error) throw error;
    const counts = {};
    (data || []).forEach(r => {
      const month = r.created_at?.slice(0, 7);
      if (month) counts[month] = (counts[month] || 0) + 1;
    });
    const result = Object.entries(counts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 12);
    res.json({ monthlyTrend: result, sql });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SLA compliance
app.get('/api/analytics/sla-compliance', authenticateToken, async (req, res) => {
  const sql = `
    SELECT cat.category_name, cat.sla_days,
      COUNT(*) FILTER (WHERE c.status = 'Resolved') AS resolved_count,
      COUNT(*) AS total_count,
      ROUND(
        100.0 * COUNT(*) FILTER (WHERE c.status = 'Resolved'
          AND c.updated_at <= c.created_at + cat.sla_days * INTERVAL '1 day')
        / NULLIF(COUNT(*) FILTER (WHERE c.status = 'Resolved'), 0), 2
      ) AS compliance_pct
    FROM complaint c
    JOIN category cat ON cat.category_id = c.category_id
    GROUP BY cat.category_name, cat.sla_days
    ORDER BY cat.category_name;
  `;
  logQuery('ANALYTICS_SLA_COMPLIANCE', sql);

  try {
    const { data: complaints } = await supabase.from('complaint')
      .select('status, created_at, updated_at, category:category_id(category_name, sla_days)');
    const { data: cats } = await supabase.from('category')
      .select('category_id, category_name, sla_days');

    const result = (cats || []).map(cat => {
      const catComplaints = (complaints || []).filter(c => c.category?.category_name === cat.category_name);
      const resolved = catComplaints.filter(c => c.status === 'Resolved');
      const withinSla = resolved.filter(c => {
        if (!c.updated_at || !c.created_at) return false;
        const created = new Date(c.created_at);
        const updated = new Date(c.updated_at);
        const slaMsec = cat.sla_days * 24 * 60 * 60 * 1000;
        return (updated - created) <= slaMsec;
      });
      return {
        category_name: cat.category_name,
        sla_days: cat.sla_days,
        total_count: catComplaints.length,
        resolved_count: resolved.length,
        compliance_pct: resolved.length > 0
          ? Math.round((withinSla.length / resolved.length) * 100 * 100) / 100
          : null,
      };
    });

    res.json({ slaCompliance: result, sql });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Staff workload view
app.get('/api/analytics/staff-workload', authenticateToken, async (req, res) => {
  const workloadSql = `SELECT * FROM v_staff_workload ORDER BY active_assignments DESC;`;
  logQuery('STAFF_WORKLOAD_VIEW', workloadSql);

  try {
    const { data, error } = await supabase.from('v_staff_workload')
      .select('*').order('active_assignments', { ascending: false });
    if (error) throw error;
    res.json({ workload: data || [], sql: workloadSql });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SLA Escalation (calls PostgreSQL stored function)
app.post('/api/analytics/escalate-overdue', authenticateToken, async (req, res) => {
  const rpcSql = `
    -- Calls PL/pgSQL function:
    SELECT escalate_overdue_complaints();
    -- Inside function:
    UPDATE complaint SET status = 'Escalated', updated_at = now()
    WHERE status NOT IN ('Resolved', 'Escalated')
      AND created_at < now() - (
        SELECT sla_days * INTERVAL '1 day' FROM category
        WHERE category_id = complaint.category_id
      );
  `;
  logQuery('EXECUTE_SLA_ESCALATION_RPC', rpcSql);

  try {
    const { data, error } = await supabase.rpc('escalate_overdue_complaints');
    if (error) {
      // Fallback: manual escalation if RPC not found
      console.warn('RPC not found, running manual escalation');
      const { data: cats } = await supabase.from('category').select('category_id, sla_days');
      let escalatedCount = 0;
      for (const cat of cats || []) {
        const cutoff = new Date(Date.now() - cat.sla_days * 24 * 60 * 60 * 1000).toISOString();
        const { data: updated } = await supabase.from('complaint')
          .update({ status: 'Escalated', updated_at: new Date().toISOString() })
          .eq('category_id', cat.category_id)
          .lt('created_at', cutoff)
          .not('status', 'in', '("Resolved","Escalated")')
          .select();
        escalatedCount += (updated || []).length;
      }
      return res.json({ escalatedCount, sql: rpcSql });
    }
    res.json({ escalatedCount: data ?? 0, sql: rpcSql });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 16. STUDENT SUMMARY VIEW
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/student/summary', authenticateToken, async (req, res) => {
  const { id } = req.user;
  const sql = `SELECT * FROM v_student_summary WHERE student_id = ${id};`;
  logQuery('STUDENT_SUMMARY_VIEW', sql);

  try {
    const { data, error } = await supabase.from('v_student_summary')
      .select('*').eq('student_id', id).maybeSingle();
    if (error) throw error;
    res.json({ summary: data, sql });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 17. NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/notifications', authenticateToken, async (req, res) => {
  const { email } = req.user;
  const sql = `
    SELECT * FROM notification
    WHERE user_email = '${email}' AND is_read = false
    ORDER BY created_at DESC;
  `;
  logQuery('GET_NOTIFICATIONS', sql);

  try {
    const { data, error } = await supabase.from('notification')
      .select('*').eq('user_email', email).eq('is_read', false)
      .order('created_at', { ascending: false });
    // If table doesn't exist, return empty
    res.json({ notifications: data || [], sql });
  } catch (err) {
    res.json({ notifications: [], sql, note: 'Notification table may not exist' });
  }
});

app.patch('/api/notifications/read', authenticateToken, async (req, res) => {
  const { email } = req.user;
  const sql = `UPDATE notification SET is_read = true WHERE user_email = '${email}' AND is_read = false;`;
  logQuery('MARK_NOTIFICATIONS_READ', sql);

  try {
    await supabase.from('notification')
      .update({ is_read: true }).eq('user_email', email).eq('is_read', false);
    res.json({ message: 'All notifications marked read', sql });
  } catch (err) {
    res.json({ message: 'done', sql });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 18. FEEDBACK (rate resolved complaint)
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/feedback', authenticateToken, async (req, res) => {
  const { complaintId, rating, comments } = req.body;
  const sql = `
    -- Feedback stored in status_history as a note
    INSERT INTO status_history (complaint_id, status, changed_by, note)
    VALUES (${complaintId}, 'Resolved', 'Student', 'Rating: ${rating}/5 - ${comments}')
    RETURNING *;
  `;
  logQuery('SUBMIT_FEEDBACK', sql);

  try {
    // Store feedback as a status_history note
    const { data: lastHistory } = await supabase.from('status_history')
      .select('history_num').eq('complaint_id', complaintId)
      .order('history_num', { ascending: false }).limit(1).maybeSingle();

    const nextNum = (lastHistory?.history_num ?? 0) + 1;

    await supabase.from('status_history').insert({
      complaint_id: parseInt(complaintId),
      history_num: nextNum,
      status: 'Resolved',
      changed_by: req.user.email,
      note: `Feedback: ${rating}/5 stars — "${comments || 'No comment'}"`,
    });

    res.json({ message: 'Feedback submitted successfully', sql });
  } catch (err) {
    console.error('Feedback error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Campus Complaint Tracker Backend running on port ${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`🗄️  Supabase: ${process.env.SUPABASE_URL}`);
  console.log(`🔑 Using service role key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'YES ✅' : 'NO ❌ (using anon)'}\n`);
});
