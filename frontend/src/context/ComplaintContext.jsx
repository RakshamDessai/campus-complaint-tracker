import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { apiRequest } from '../lib/api';
import {
  getMyComplaints,
  getAllComplaints,
  getWardenComplaints,
  getStaffQueue,
  fileComplaint,
  updateComplaintStatus,
  assignStaff,
  getCategories,
  getDepartments,
  getHostels,
  getStaffMembers,
  getStatusHistory,
} from '../lib/db';

const ComplaintContext = createContext();

export function ComplaintProvider({ children }) {
  const { session, profile, role } = useAuth();

  /* ─── State ─── */
  const [complaints,   setComplaints]   = useState([]);
  const [timelines,    setTimelines]    = useState({});
  const [categories,   setCategories]   = useState([]);
  const [departments,  setDepartments]  = useState([]);
  const [hostels,      setHostels]      = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [feedbacks,    setFeedbacks]    = useState({});
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const pollingRef = useRef(null);

  /* ─── Derived: build currentUser from auth profile ─── */
  useEffect(() => {
    if (!profile || !role) { setCurrentUser(null); return; }
    if (role === 'Student') {
      setCurrentUser({
        role: 'Student',
        name: `${profile.first_name} ${profile.last_name}`,
        rollNo: profile.student_id,
        email: profile.email,
        hostel: profile.hostel?.hostel_name ?? '',
        room: profile.room_no,
        studentId: profile.student_id,
      });
    } else {
      setCurrentUser({
        role,
        name: `${profile.first_name} ${profile.last_name}`,
        staffId: profile.staff_id,
        email: profile.email,
        designation: profile.designation,
        department: profile.department?.dept_name ?? '',
        deptId: profile.department?.dept_id ?? null,
        hostelId: profile.hostel_id ?? null,
        hostelName: profile.hostel_name ?? '',
      });
    }
  }, [profile, role]);

  /* ─── Fetch lookup data via single /api/lookups call ─── */
  const fetchLookups = useCallback(async () => {
    try {
      const data = await apiRequest('/lookups', 'GET');
      if (data.categories)   setCategories(data.categories);
      if (data.departments)  setDepartments(data.departments);
      if (data.hostels)      setHostels(data.hostels);
      if (data.staffMembers) setStaffMembers(data.staffMembers);
    } catch (e) {
      console.error('fetchLookups error:', e.message);
    }
  }, []);

  /* ─── Fetch complaints based on role ─── */
  const refreshComplaints = useCallback(async () => {
    if (!session || !profile || !role) return;
    setLoading(true);
    setError(null);
    try {
      let res;
      if (role === 'Student') {
        res = await getMyComplaints(profile.student_id);
      } else if (role === 'Staff') {
        res = await getStaffQueue(profile.staff_id);
      } else if (role === 'Warden') {
        const hostelId = profile.hostel_id ?? profile.hostel?.hostel_id;
        if (hostelId) {
          res = await getWardenComplaints(hostelId);
        } else {
          res = await getAllComplaints();
        }
      } else {
        res = await getAllComplaints();
      }
      if (res.error) setError(res.error.message || String(res.error));
      else setComplaints(res.data ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [session, profile, role]);

  /* ─── On mount: fetch lookups ─── */
  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  /* ─── On auth change: fetch complaints ─── */
  useEffect(() => {
    refreshComplaints();
  }, [refreshComplaints]);

  /* ─── Polling for real-time updates (every 30s) ─── */
  useEffect(() => {
    if (!session) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }
    pollingRef.current = setInterval(() => {
      refreshComplaints();
    }, 30000); // 30 seconds
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [session, refreshComplaints]);

  /* ─── Actions ─── */

  const addComplaint = useCallback(async ({ categoryId, description, studentId }) => {
    setError(null);
    const { data, error: err } = await fileComplaint({ description, studentId, categoryId });
    if (err) { setError(err.message || String(err)); return null; }
    await refreshComplaints();
    return data;
  }, [refreshComplaints]);

  const updateStatus = useCallback(async (complaintId, newStatus) => {
    setError(null);
    const { error: err } = await updateComplaintStatus(complaintId, newStatus);
    if (err) { setError(err.message || String(err)); return; }
    await refreshComplaints();
  }, [refreshComplaints]);

  const assignStaffToTicket = useCallback(async (complaintId, staffId) => {
    setError(null);
    const { error: err } = await assignStaff(staffId, complaintId);
    if (err) { setError(err.message || String(err)); return; }
    await refreshComplaints();
  }, [refreshComplaints]);

  /* ─── Feedback (stored in backend via /api/feedback) ─── */
  const submitFeedback = useCallback(async (complaintId, rating, comments) => {
    try {
      await apiRequest('/feedback', 'POST', { complaintId, rating, comments });
    } catch (e) {
      console.error('Feedback error:', e.message);
    }
    const now = new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    setFeedbacks(prev => ({ ...prev, [complaintId]: { rating, comments, submittedAt: now } }));
    setTimelines(prev => {
      const existing = prev[complaintId] || [];
      return {
        ...prev,
        [complaintId]: [
          ...existing,
          {
            historyNum: existing.length + 1,
            status: 'Resolved',
            timestamp: now,
            user: currentUser?.name ? `${currentUser.name} (Student)` : 'Student',
            note: `Feedback: ${rating}★ — "${comments || 'No comment'}"`,
          },
        ],
      };
    });
  }, [currentUser]);

  /* ─── SLA config update (calls backend PATCH /api/categories/:id/sla) ─── */
  const updateCategorySla = useCallback(async (categoryId, newDays) => {
    try {
      await apiRequest(`/categories/${categoryId}/sla`, 'PATCH', { sla_days: newDays });
    } catch (e) {
      console.error('SLA update error:', e.message);
    }
    setCategories(prev => prev.map(c =>
      c.category_id === categoryId ? { ...c, sla_days: parseInt(newDays) || 1 } : c
    ));
  }, []);

  const toggleStaffAvailability = useCallback((staffId) => {
    setStaffMembers(prev => prev.map(s =>
      s.staff_id === staffId ? { ...s, is_available: !s.is_available } : s
    ));
  }, []);

  /* ─── Context value ─── */
  return (
    <ComplaintContext.Provider
      value={{
        // Data
        complaints,
        timelines,
        categories,
        departments,
        hostels,
        staffMembers,
        feedbacks,
        // User
        currentUser,
        setCurrentUser,
        // Actions
        addComplaint,
        updateStatus,
        assignStaffToTicket,
        submitFeedback,
        updateCategorySla,
        toggleStaffAvailability,
        // Extra
        loading,
        error,
        refreshComplaints,
        fetchLookups,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
}

export function useComplaints() {
  const context = useContext(ComplaintContext);
  if (!context) throw new Error('useComplaints must be used within a ComplaintProvider');
  return context;
}

export default ComplaintContext;
