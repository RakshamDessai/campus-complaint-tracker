import { apiRequest, setToken, removeToken, getToken } from './api';

/**
 * Student Sign In
 * SQL executed by Backend:
 *   SELECT s.*, h.hostel_name
 *   FROM student s
 *   JOIN hostel h ON h.hostel_id = s.hostel_id
 *   WHERE LOWER(s.email) = LOWER($1);
 */
export async function studentSignIn(email, password) {
  try {
    const data = await apiRequest('/auth/student/login', 'POST', { email, password });
    if (data.token) {
      setToken(data.token);
    }
    return { session: { token: data.token, user: data.profile }, profile: data.profile, role: 'Student' };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Student Sign Up
 * SQL executed by Backend:
 *   INSERT INTO student (first_name, last_name, email, room_no, hostel_id)
 *   VALUES ($1, $2, $3, $4, $5)
 *   RETURNING student_id, first_name, last_name, email, room_no, hostel_id;
 */
export async function studentSignUp({ email, password, firstName, lastName, roomNo, hostelId }) {
  try {
    const data = await apiRequest('/auth/student/register', 'POST', {
      email,
      password,
      firstName,
      lastName,
      roomNo,
      hostelId: parseInt(hostelId, 10),
    });
    if (data.token) {
      setToken(data.token);
    }
    return { session: { token: data.token, user: data.profile }, profile: data.profile, role: 'Student' };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Staff / Admin Sign In
 * SQL executed by Backend:
 *   SELECT st.*, d.dept_name, h.hostel_id, h.hostel_name
 *   FROM staff st
 *   LEFT JOIN department d ON d.dept_id = st.dept_id
 *   LEFT JOIN hostel h ON h.warden_id = st.staff_id
 *   WHERE LOWER(st.email) = LOWER($1);
 */
export async function staffSignIn(email, password) {
  try {
    const data = await apiRequest('/auth/staff/login', 'POST', { email, password });
    if (data.token) {
      setToken(data.token);
    }
    return { session: { token: data.token, user: data.profile }, profile: data.profile, role: data.role };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Sign Out
 */
export async function signOut() {
  removeToken();
  return { error: null };
}

/**
 * Get current session profile from JWT token
 */
export async function getSession() {
  const token = getToken();
  if (!token) return { session: null, user: null, role: null };
  try {
    const data = await apiRequest('/auth/me', 'GET');
    return { session: { token }, user: data.user, role: data.role };
  } catch (err) {
    removeToken();
    return { session: null, user: null, role: null };
  }
}
