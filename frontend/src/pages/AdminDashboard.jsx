import React from 'react';
import { motion } from 'framer-motion';
import { useComplaints } from '../context/ComplaintContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import { 
  Building2, 
  Settings, 
  BarChart3, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { departments, categories, staffMembers, complaints } = useComplaints();
  const { toast } = useToast();

  const total = complaints.length;
  const inProgress = complaints.filter(c => c.Status === 'In-Progress').length;
  const resolved = complaints.filter(c => c.Status === 'Resolved').length;
  const escalated = complaints.filter(c => c.Is_Escalated || c.Status === 'Escalated').length;

  return (
    <div className="space-y-6">
      
      {/* Executive Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-900/60 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Central Administration &amp; Governance</span>
          </div>
          <h1 className="text-2xl font-bold">Executive Campus Analytics Overview</h1>
          <p className="text-xs text-slate-300 mt-1">
            Global oversight across all departments, maintenance SLA thresholds, and staff allocation.
          </p>
        </div>

        {/* Quick Nav Shortcut Buttons */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <Link to="/admin/sla" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" /> SLAs
          </Link>
          <Link to="/admin/roster" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Staff Roster
          </Link>
          <Link to="/admin/analytics" className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" /> Full Reports
          </Link>
        </div>
      </div>

      {/* Metrics Grid with Staggered Motion */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          whileHover={{ y: -4, scale: 1.02 }}
          onClick={() => toast.info(`Central DBMS stores ${total} lifetime campus complaints across 4 infrastructure departments.`, { title: 'Institutional Telemetry', badge: 'Database Metrics' })}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Campus Complaints</span>
          <span className="text-2xl font-extrabold text-slate-900">{total}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Total recorded</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ y: -4, scale: 1.02 }}
          onClick={() => toast.info(`${inProgress} work orders currently active in technician diagnostic pipelines.`, { title: 'Active Repairs', badge: 'Staff Queue' })}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> Active Repairs
          </span>
          <span className="text-2xl font-extrabold text-blue-600">{inProgress}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Work underway</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          whileHover={{ y: -4, scale: 1.02 }}
          onClick={() => toast.success(`${resolved} issues resolved. Campus-wide SLA compliance rate is currently ${total > 0 ? Math.round((resolved / total) * 100) : 0}%.`, { title: 'Resolution Compliance', badge: 'Performance' })}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </span>
          <span className="text-2xl font-extrabold text-emerald-600">{resolved}</span>
          <span className="text-[11px] text-slate-400 block mt-1">
            {total > 0 ? Math.round((resolved / total) * 100) : 0}% compliance rate
          </span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ y: -4, scale: 1.02 }}
          onClick={() => toast.warning(`${escalated} critical breach tickets requiring administrative review and reallocation.`, { title: 'Critical SLA Overruns', badge: 'Action Required' })}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 animate-bounce" /> Breached &amp; Escalated
          </span>
          <span className="text-2xl font-extrabold text-rose-600">{escalated}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Exceeded standard SLA</span>
        </motion.div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments.map((dept) => {
          const deptComplaints = complaints.filter(c => c.Dept_ID === dept.Dept_ID);
          const deptResolved = deptComplaints.filter(c => c.Status === 'Resolved');
          const deptPending = deptComplaints.filter(c => c.Status !== 'Resolved');

          return (
            <div key={dept.Dept_ID} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{dept.Dept_Name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Head: {dept.Dept_Head}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {dept.Dept_ID}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total</span>
                  <span className="font-bold text-slate-800 block text-base">{deptComplaints.length}</span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-600 uppercase font-semibold">Pending</span>
                  <span className="font-bold text-blue-600 block text-base">{deptPending.length}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-600 uppercase font-semibold">Resolved</span>
                  <span className="font-bold text-emerald-600 block text-base">{deptResolved.length}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Institutional Complaints */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Campus-Wide Activity Feed</h2>
          <span className="text-xs text-slate-400">Latest grievance transitions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Issue</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.slice(0, 6).map(t => (
                <tr key={t.Complaint_ID} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">
                    {t.Complaint_ID}
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-medium">
                    {t.Student_Name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                    {t.Title}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={t.Status} />
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {t.Assigned_Staff || 'Unassigned'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/student/complaints/${t.Complaint_ID}`}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Audit &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
