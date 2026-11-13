/**
 * db.js — All data functions call the Node.js backend REST API.
 * NO direct Supabase calls from frontend.
 * Backend URL: http://localhost:5000/api
 *
 * NOTE: Functions return dual-compatible responses:
 * - Direct array usage: data.filter(...), data.length, data.map(...)
 * - Destructured usage: const { data, error } = await func();
 * - Context usage: res.data ?? []
 */
import { apiRequest } from './api';

/**
 * Wrap an array so it works BOTH as an array AND as an object with { data, error }
 */
function wrapArray(arr, err = null) {
  const result = Array.isArray(arr) ? [...arr] : [];
  result.data = result;
  result.error = err;
  return result;
}

/**
 * Wrap an object so it works BOTH directly AND via .data
 */
function wrapObject(obj, err = null) {
  const result = obj && typeof obj === 'object' ? { ...obj } : {};
  result.data = obj;
  result.error = err;
  return result;
}

/* ───────────────────────────────────────────────
   STUDENT FUNCTIONS
─────────────────────────────────────────────── */

/**
 * Get complaints for the logged-in student.
 * Backend SQL: SELECT * FROM v_complaint_details WHERE student_id = $1 ORDER BY created_at DESC;
 */
export async function getMyComplaints(studentId) {
  try {
    const data = await apiRequest('/complaints', 'GET');
    return wrapArray(data.complaints || []);
  } catch (err) {
    return wrapArray([], err);
  }
}

/**
 * File a new complaint.
 * Backend SQL: INSERT INTO complaint (description, student_id, category_id) VALUES (...)
 */
export async function fileComplaint({ description, studentId, categoryId }) {
  try {
    const data = await apiRequest('/complaints', 'POST', { description, categoryId });
    return wrapObject(data.complaint);
  } catch (err) {
    return wrapObject(null, err);
  }
}

/**
 * Get full detail for a single complaint + status history.
 * Backend SQL: SELECT * FROM v_complaint_details WHERE complaint_id = $1;
 *              SELECT * FROM status_history WHERE complaint_id = $1 ORDER BY history_num;
 */
export async function getComplaintDetail(complaintId) {
  try {
    const data = await apiRequest(`/complaints/${complaintId}`, 'GET');
    const result = {
      ...(data.detail || {}),
      data: data.detail,
      history: data.history || [],
      assignments: data.assignments || [],
      error: null,
    };
    return result;
  } catch (err) {
    return { data: null, history: [], assignments: [], error: err };
  }
}

/**
 * Get status timeline for a complaint.
 * Backend SQL: SELECT * FROM status_history WHERE complaint_id = $1 ORDER BY history_num ASC;
 */
export async function getStatusHistory(complaintId) {
  try {
    const data = await apiRequest(`/complaints/${complaintId}`, 'GET');
    return wrapArray(data.history || []);
  } catch (err) {
    return wrapArray([], err);
  }
}

/* ───────────────────────────────────────────────
   STAFF FUNCTIONS
─────────────────────────────────────────────── */

/**
 * Get active queue for a staff member.
 * Backend SQL: SELECT ... FROM staff_assignment JOIN complaint ... WHERE sa.staff_id = $1 AND sa.unassigned_at IS NULL
 */
export async function getStaffQueue(staffId) {
  try {
    const data = await apiRequest(`/staff/${staffId}/queue`, 'GET');
    return wrapArray(data.queue || []);
  } catch (err) {
    return wrapArray([], err);
  }
}

/**
 * Update complaint status.
 * Backend SQL: UPDATE complaint SET status = $2, updated_at = now() WHERE complaint_id = $1
 */
export async function updateComplaintStatus(complaintId, newStatus) {
  try {
    const data = await apiRequest(`/complaints/${complaintId}/status`, 'PATCH', { status: newStatus });
    return wrapObject(data.complaint);
  } catch (err) {
    return wrapObject(null, err);
  }
}

/**
 * Resolve a complaint.
 */
export async function resolveComplaint(complaintId) {
  return updateComplaintStatus(complaintId, 'Resolved');
}

/* ───────────────────────────────────────────────
   WARDEN FUNCTIONS
─────────────────────────────────────────────── */

/**
 * Get all complaints for a hostel (Warden view).
 * Backend SQL: SELECT * FROM v_complaint_details WHERE hostel_id = $1 ORDER BY created_at DESC;
 */
export async function getWardenComplaints(hostelId) {
  try {
    const data = await apiRequest(`/warden/${hostelId}/complaints`, 'GET');
    return wrapArray(data.complaints || []);
  } catch (err) {
    return wrapArray([], err);
  }
}

/**
 * Assign a staff member to a complaint.
 * Backend SQL: INSERT INTO staff_assignment (staff_id, complaint_id, assigned_at) VALUES (...)
 */
export async function assignStaff(staffId, complaintId) {
  try {
    const data = await apiRequest(`/complaints/${complaintId}/assign`, 'POST', { staffId });
    return wrapObject(data);
  } catch (err) {
    return wrapObject(null, err);
  }
}

/**
 * Unassign a staff member from a complaint.
 * Backend SQL: UPDATE staff_assignment SET unassigned_at = now() WHERE ...
 */
export async function unassignStaff(staffId, complaintId) {
  try {
    const data = await apiRequest(`/complaints/${complaintId}/unassign`, 'PATCH', { staffId });
    return wrapObject(data);
  } catch (err) {
    return wrapObject(null, err);
  }
}

/* ───────────────────────────────────────────────
   ADMIN FUNCTIONS
─────────────────────────────────────────────── */

/**
 * Get all complaints (Admin view).
 * Backend SQL: SELECT * FROM v_complaint_details ORDER BY created_at DESC;
 */
export async function getAllComplaints() {
  try {
    const data = await apiRequest('/complaints', 'GET');
    return wrapArray(data.complaints || []);
  } catch (err) {
    return wrapArray([], err);
  }
}

/**
 * Get dashboard stats.
 * Backend SQL: SELECT COUNT(*) FILTER (WHERE status = ...) FROM complaint;
 */
export async function getDashboardStats() {
  try {
    const data = await apiRequest('/analytics/dashboard-stats', 'GET');
    const s = data.stats || {};
    const counts = {
      Open: s.open || 0,
      Assigned: s.assigned || 0,
      'In Progress': s.inProgress || 0,
      Resolved: s.resolved || 0,
      Escalated: s.escalated || 0,
      total: s.total || 0,
      open: s.open || 0,
      assigned: s.assigned || 0,
      inProgress: s.inProgress || 0,
      resolved: s.resolved || 0,
      escalated: s.escalated || 0,
    };
    return wrapObject(counts);
  } catch (err) {
    return wrapObject({ Open: 0, Assigned: 0, 'In Progress': 0, Resolved: 0, Escalated: 0, total: 0 }, err);
  }
}

/**
 * Get staff workload from view.
 * Backend SQL: SELECT * FROM v_staff_workload ORDER BY active_assignments DESC;
 */
export async function getStaffWorkload() {
  try {
    const data = await apiRequest('/analytics/staff-workload', 'GET');
    return wrapArray(data.workload || []);
  } catch (err) {
    return wrapArray([], err);
  }
}

/**
 * Get student summary from view.
 * Backend SQL: SELECT * FROM v_student_summary WHERE student_id = $1;
 */
export async function getStudentSummary(studentId) {
  try {
    const data = await apiRequest('/student/summary', 'GET');
    return wrapObject(data.summary);
  } catch (err) {
    return wrapObject(null, err);
  }
}

/* ───────────────────────────────────────────────
   LOOKUP / REFERENCE DATA
─────────────────────────────────────────────── */

/**
 * Get all complaint categories joined with department.
 */
export async function getCategories() {
  try {
    const data = await apiRequest('/lookups', 'GET');
    return wrapArray(data.categories || []);
  } catch (err) {
    return wrapArray([], err);
  }
}

/**
 * Get all departments.
 */
export async function getDepartments() {
  try {
    const data = await apiRequest('/lookups', 'GET');
    return wrapArray(data.departments || []);
  } catch (err) {
    return wrapArray([], err);
  }
}

/**
 * Get all hostels.
 */
export async function getHostels() {
  try {
    const data = await apiRequest('/lookups', 'GET');
    return wrapArray(data.hostels || []);
  } catch (err) {
    return wrapArray([], err);
  }
}

/**
 * Get all staff members.
 */
export async function getStaffMembers() {
  try {
    const data = await apiRequest('/lookups', 'GET');
    return wrapArray(data.staffMembers || []);
  } catch (err) {
    return wrapArray([], err);
  }
}

/**
 * Get staff members filtered by department.
 */
export async function getStaffByDept(deptId) {
  try {
    const data = await apiRequest('/lookups', 'GET');
    const filtered = (data.staffMembers || []).filter(s =>
      s.department?.dept_id === parseInt(deptId) || s.dept_id === parseInt(deptId)
    );
    return wrapArray(filtered);
  } catch (err) {
    return wrapArray([], err);
  }
}

/* ───────────────────────────────────────────────
   SLA & ANALYTICS
─────────────────────────────────────────────── */

/**
 * Run SLA escalation stored procedure.
 */
export async function runSlaEscalation() {
  try {
    const data = await apiRequest('/analytics/escalate-overdue', 'POST');
    const count = data.escalatedCount ?? 0;
    const res = { count, escalatedCount: count };
    res.data = count;
    res.error = null;
    return res;
  } catch (err) {
    return { count: 0, data: null, error: err };
  }
}

/**
 * Get all analytics data.
 */
export async function getAnalytics() {
  try {
    const [byCat, byStatus, monthly, sla] = await Promise.all([
      apiRequest('/analytics/by-category', 'GET'),
      apiRequest('/analytics/by-status', 'GET'),
      apiRequest('/analytics/monthly-trend', 'GET'),
      apiRequest('/analytics/sla-compliance', 'GET'),
    ]);

    const complaintsByCategory = {};
    (byCat.byCategory || []).forEach(r => { complaintsByCategory[r.category_name] = r.complaint_count; });

    const complaintsByStatus = {};
    (byStatus.byStatus || []).forEach(r => { complaintsByStatus[r.status] = r.count; });

    const monthlyTrend = (monthly.monthlyTrend || []).map(r => ({
      month: r.month,
      filed: r.count,
      total: r.count,
      resolved: 0,
      breached: 0
    }));

    const result = {
      complaintsByCategory,
      complaintsByStatus,
      monthlyTrend,
      slaCompliance: sla.slaCompliance || [],
    };
    result.data = result;
    result.error = null;
    return result;
  } catch (err) {
    return wrapObject({
      complaintsByCategory: {},
      complaintsByStatus: {},
      monthlyTrend: [],
      slaCompliance: [],
    }, err);
  }
}

/* ───────────────────────────────────────────────
   NOTIFICATIONS
─────────────────────────────────────────────── */

/**
 * Get unread notifications for a user.
 */
export async function getNotifications(userEmail) {
  try {
    const data = await apiRequest('/notifications', 'GET');
    return wrapArray(data.notifications || []);
  } catch (err) {
    return wrapArray([], err);
  }
}

/**
 * Mark all notifications as read.
 */
export async function markNotificationsRead(userEmail) {
  try {
    const data = await apiRequest('/notifications/read', 'PATCH');
    return wrapObject(data);
  } catch (err) {
    return wrapObject(null, err);
  }
}

/* ───────────────────────────────────────────────
   STUB — Realtime (polling handled in ComplaintContext)
─────────────────────────────────────────────── */

export function subscribeToComplaints(callback) {
  return { unsubscribe: () => {} };
}
