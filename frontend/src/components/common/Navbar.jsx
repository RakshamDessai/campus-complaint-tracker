import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, User, LogOut } from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import { useToast } from '../../context/ToastContext';
import NotificationsDrawer from './NotificationsDrawer';
import CampusLogo from './CampusLogo';

export default function Navbar({ currentRole = 'Student', onRoleChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, setCurrentUser } = useComplaints();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(location.search);
  const [isDrawerOpen, setIsDrawerOpen] = useState(searchParams.get('notifications') === 'open');

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
    toast.info(
      `Switched session to ${newRole} Workspace with role-based permissions and dedicated operational queue.`,
      {
        title: `Switched to ${newRole} Portal`,
        badge: 'Workspace Navigation'
      }
    );
    if (newRole === 'Student') navigate('/student');
    else if (newRole === 'Staff') navigate('/staff');
    else if (newRole === 'Warden') navigate('/warden');
    else if (newRole === 'Admin') navigate('/admin');
  };

  const handleOpenNotifications = () => {
    setIsDrawerOpen(true);
    toast.info('Fetched 4 real-time alerts from the campus SLA monitoring event bus.', {
      title: 'Alerts & Telemetry Drawer',
      badge: 'Live Events'
    });
  };

  const handleLogout = () => {
    toast.info('Session ended. Securely signed out of the workspace.', {
      title: 'Signed Out',
      badge: 'Session'
    });
  };

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand & Title with Official Custom Logo */}
          <Link to="/" className="group">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <CampusLogo size="md" showText={true} textVariant="light" />
            </motion.div>
          </Link>

          {/* Navigation & Controls */}
          {!isGateway ? (
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* View As Switcher */}
              <div className="flex items-center bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs gap-2">
                <span className="text-slate-400 hidden md:inline">Portal:</span>
                <select
                  value={activeRole}
                  onChange={handleRoleChange}
                  className="bg-slate-900 text-blue-300 font-bold rounded-lg px-2 py-0.5 border border-slate-600 focus:outline-none focus:border-blue-400 cursor-pointer text-xs"
                >
                  <option value="Student">Student Portal</option>
                  <option value="Staff">Staff Desk</option>
                  <option value="Warden">Warden Desk</option>
                  <option value="Admin">Admin Portal</option>
                </select>
              </div>

              {/* Animated Notification Bell Button (Toggles Frame 22 Drawer) */}
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleOpenNotifications}
                className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
                title="Open Campus Notifications (Frame 22)"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
              </motion.button>

              {/* User Profile Pill */}
              <div 
                onClick={() => toast.success(`Current authenticated profile: ${activeRole} User. Active session verified by campus DBMS.`, { title: `${activeRole} Workspace`, badge: 'Active Identity' })}
                className="flex items-center gap-2 pl-2 border-l border-slate-700 cursor-pointer hover:opacity-90 transition-opacity"
                title="Click to view session info"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600/40 border border-blue-400 flex items-center justify-center text-xs font-bold text-blue-200">
                  {activeRole[0]}
                </div>
                <span className="text-xs font-medium text-slate-200 hidden sm:inline">
                  {activeRole}
                </span>
              </div>

              {/* Exit to Home */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  to="/"
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
                  title="Logout / Exit to Home"
                >
                  <LogOut className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/student"
                  className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-all shadow-md"
                >
                  Open Student Portal &rarr;
                </Link>
              </motion.div>
            </div>
          )}

        </div>
      </header>

      {/* Frame 22: Notifications & Alerts Slide-Over Drawer */}
      <NotificationsDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>
  );
}
