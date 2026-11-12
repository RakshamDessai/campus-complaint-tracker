import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListOrdered, 
  History, 
  ShieldCheck, 
  Settings, 
  BarChart3, 
  AlertTriangle,
  Building,
  Users
} from 'lucide-react';

export default function Sidebar({ role = 'Student' }) {
  const getNavItems = () => {
    switch (role) {
      case 'Staff':
        return [
          { to: '/staff', label: 'My Assigned Queue', icon: ListOrdered },
          { to: '/staff/history', label: 'Resolution History', icon: History }
        ];
      case 'Warden':
        return [
          { to: '/warden', label: 'Hostel Grievance Desk', icon: Building },
          { to: '/warden/escalations', label: 'SLA Escalations', icon: AlertTriangle },
          { to: '/warden/staff', label: 'Staff Workload', icon: Users }
        ];
      case 'Admin':
        return [
          { to: '/admin', label: 'Executive Overview', icon: LayoutDashboard },
          { to: '/admin/sla', label: 'Department SLAs', icon: Settings },
          { to: '/admin/roster', label: 'Staff Roster & Matrix', icon: Users },
          { to: '/admin/analytics', label: 'Analytical Reports', icon: BarChart3 }
        ];
      case 'Student':
      default:
        return [
          { to: '/student', label: 'Student Dashboard', icon: LayoutDashboard },
          { to: '/student/new', label: 'File New Complaint', icon: PlusCircle },
          { to: '/student/complaints', label: 'My Complaints', icon: ListOrdered }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            {role} Portal Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/student' || item.to === '/staff' || item.to === '/warden' || item.to === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Clean Service Info Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Campus Grievance System</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            All tickets tracked from submission through resolution with real-time audit logging.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
        <span className="block text-[11px] font-medium text-slate-400">Campus Complaint Tracker</span>
        <span className="font-semibold text-slate-600">Official Campus Portal v1.0</span>
      </div>
    </aside>
  );
}
