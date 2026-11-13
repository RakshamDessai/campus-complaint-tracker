import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, LogOut, User } from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { signOut } from '../../lib/auth';
import NotificationsDrawer from './NotificationsDrawer';
import CampusLogo from './CampusLogo';

// Role badge colour map
const ROLE_COLORS = {
  Student: 'bg-blue-600/40 border-blue-400 text-blue-200',
  Staff:   'bg-emerald-600/40 border-emerald-400 text-emerald-200',
  Warden:  'bg-violet-600/40 border-violet-400 text-violet-200',
  Admin:   'bg-rose-600/40 border-rose-400 text-rose-200',
};

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { session, profile, role } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const [isDrawerOpen, setIsDrawerOpen] = useState(searchParams.get('notifications') === 'open');

  const isGateway =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/staff-login';

  // ── Display helpers ──────────────────────────────────────────────────────
  const displayName = profile
    ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
    : session?.user?.email ?? '';

  const activeRole = role ?? 'Guest';
  const avatarLetter = displayName?.[0]?.toUpperCase() ?? activeRole[0];
  const roleBadgeClass = ROLE_COLORS[activeRole] ?? 'bg-slate-600/40 border-slate-400 text-slate-200';

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleOpenNotifications = () => {
    setIsDrawerOpen(true);
    toast.info('Fetched real-time alerts from the campus SLA monitoring event bus.', {
      title: 'Alerts & Telemetry Drawer',
      badge: 'Live Events',
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.info('Session ended. Securely signed out of the workspace.', {
        title: 'Signed Out',
        badge: 'Session',
      });
    } catch (err) {
      console.error('Sign-out error:', err);
    } finally {
      navigate('/');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Brand & Logo */}
          <Link to="/" className="group">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <CampusLogo size="md" showText={true} textVariant="light" />
            </motion.div>
          </Link>

          {/* Navigation Controls — only shown when logged in and not on gateway pages */}
          {session && !isGateway ? (
            <div className="flex items-center gap-3 sm:gap-4">

              {/* Animated Notification Bell */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleOpenNotifications}
                className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
                title="Open Campus Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
              </motion.button>

              {/* User Identity Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold ${roleBadgeClass}`}
                >
                  {avatarLetter}
                </div>

                {/* Name + Role badge */}
                <div className="hidden sm:flex flex-col leading-tight">
                  <span className="text-xs font-semibold text-slate-100 max-w-[120px] truncate">
                    {displayName}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    {activeRole} Portal
                  </span>
                </div>
              </div>

              {/* Sign Out Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSignOut}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors flex items-center gap-1 border border-transparent hover:border-slate-700"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>

            </div>
          ) : (
            /* Minimal navbar when not logged in or on gateway */
            !isGateway && (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <User className="w-4 h-4" />
                <span>Not signed in</span>
              </div>
            )
          )}

        </div>
      </header>

      {/* Notifications Slide-Over Drawer */}
      <NotificationsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
