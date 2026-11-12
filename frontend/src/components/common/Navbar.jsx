import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Bell, User, LogOut } from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';

export default function Navbar({ currentRole = 'Student', onRoleChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, setCurrentUser } = useComplaints();

  const isGateway = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/staff-login';

  // Determine active role from current URL path
  const getActiveRole = () => {
    if (location.pathname.startsWith('/admin')) return 'Admin';
    if (location.pathname.startsWith('/warden')) return 'Warden';
    if (location.pathname.startsWith('/staff')) return 'Staff';
    if (location.pathname.startsWith('/student')) return 'Student';
    return currentRole || 'Student';
  };

  const activeRole = getActiveRole();

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    if (onRoleChange) onRoleChange(newRole);
    if (setCurrentUser) {
      setCurrentUser(prev => ({ ...prev, role: newRole }));
    }
    if (newRole === 'Student') navigate('/student');
    else if (newRole === 'Staff') navigate('/staff');
    else if (newRole === 'Warden') navigate('/warden');
    else if (newRole === 'Admin') navigate('/admin');
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Title */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center border border-blue-400/30 group-hover:bg-blue-500 transition-colors">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-sm sm:text-base text-white block leading-tight">
              CAMPUS COMPLAINT &amp; GRIEVANCE TRACKER
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Student &amp; Campus Maintenance Services
            </span>
          </div>
        </Link>

        {/* Navigation & Controls */}
        {!isGateway ? (
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* View As Switcher */}
            <div className="flex items-center bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs gap-2">
              <span className="text-slate-400 hidden md:inline">Portal:</span>
              <select
                value={activeRole}
                onChange={handleRoleChange}
                className="bg-slate-900 text-blue-300 font-bold rounded px-2 py-0.5 border border-slate-600 focus:outline-none focus:border-blue-400 cursor-pointer text-xs"
              >
                <option value="Student">Student Portal</option>
                <option value="Staff">Staff Desk</option>
                <option value="Warden">Warden Desk</option>
                <option value="Admin">Admin Portal</option>
              </select>
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              <div className="w-8 h-8 rounded-full bg-blue-600/40 border border-blue-400 flex items-center justify-center text-xs font-bold text-blue-200">
                {activeRole[0]}
              </div>
              <span className="text-xs font-medium text-slate-200 hidden sm:inline">
                {activeRole}
              </span>
            </div>

            {/* Exit to Home */}
            <Link
              to="/"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
              title="Logout / Exit to Home"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/student"
              className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              Open Student Portal &rarr;
            </Link>
          </div>
        )}

      </div>
    </header>
  );
}
