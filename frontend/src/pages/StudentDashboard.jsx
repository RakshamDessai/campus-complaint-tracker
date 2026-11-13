import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useComplaints } from '../context/ComplaintContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Building, 
  Phone,
  FileText,
  Copy
} from 'lucide-react';

export default function StudentDashboard() {
  const { complaints, currentUser, loading } = useComplaints();
  const { toast } = useToast();
  
  // Complaints belonging to the active student (supporting both mock & Supabase schema)
  const studentId = currentUser?.student_id || currentUser?.studentId || currentUser?.rollNo || currentUser?.id;
  const filteredByStudent = complaints.filter(c => {
    const cid = c.Student_ID || c.student_id;
    return studentId && String(cid) === String(studentId);
  });
  const studentComplaints = filteredByStudent.length > 0 ? filteredByStudent : complaints;
  
  const stats = {
    total: studentComplaints.length,
    active: studentComplaints.filter(c => {
      const s = c.Status || c.status;
      return s === 'Open' || s === 'Assigned' || s === 'In-Progress';
    }).length,
    resolved: studentComplaints.filter(c => (c.Status || c.status) === 'Resolved').length,
    escalated: studentComplaints.filter(c => c.Is_Escalated || c.is_overdue || (c.Status || c.status) === 'Escalated').length
  };

  const handleCopyTicket = (id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id);
    }
    toast.info(`Ticket reference #${id} copied to clipboard.`, {
      title: 'Copied to Clipboard',
      badge: 'Clipboard'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-3"></div>
          <div className="h-4 bg-slate-100 rounded w-1/4"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse">
              <div className="h-3 bg-slate-200 rounded w-2/3 mb-3"></div>
              <div className="h-8 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Student Welcome Header Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <span>Student Resident</span> • <span>Student ID: {currentUser?.student_id || currentUser?.rollNo || 'STU-2026-042'}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {currentUser?.first_name ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim() : (currentUser?.name || 'Resident')}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              {currentUser?.hostel?.hostel_name || currentUser?.hostel || 'Hostel'} • Room {currentUser?.room_no || currentUser?.room || 'N/A'}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              +91 98765 43210
            </span>
          </div>
        </div>

        <Link
          to="/student/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>File New Complaint</span>
        </Link>
      </div>

      {/* KPI Metric Cards with Staggered Entrance & Interactive Lift */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          whileHover={{ y: -4, scale: 1.02 }}
          onClick={() => toast.info(`You have filed ${stats.total} total grievances across campus facilities this semester.`, { title: 'Lifetime Summary', badge: 'Resident Dossier' })}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Filed
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.total}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Lifetime registered</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ y: -4, scale: 1.02 }}
          onClick={() => toast.info(`${stats.active} complaint(s) currently being processed by maintenance dispatchers.`, { title: 'Active Work Orders', badge: 'Queue Status' })}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            Active Queue
          </div>
          <div className="text-2xl font-extrabold text-blue-600">{stats.active}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Open / In-Progress</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          whileHover={{ y: -4, scale: 1.02 }}
          onClick={() => toast.success(`${stats.resolved} complaint(s) successfully inspected, verified, and resolved.`, { title: 'Resolved Grievances', badge: 'Completed' })}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resolved
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{stats.resolved}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Successfully fixed</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ y: -4, scale: 1.02 }}
          onClick={() => toast.warning(`${stats.escalated} complaint(s) elevated to Chief Administration under SLA auto-escalation triggers.`, { title: 'SLA Escalations', badge: 'High Priority' })}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
            SLA Escalated
          </div>
          <div className="text-2xl font-extrabold text-rose-600">{stats.escalated}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Under warden review</span>
        </motion.div>

      </div>

      {/* Recent Complaints Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Registered Grievances</h2>
            <p className="text-xs text-slate-500 mt-0.5">Click any grievance to view live status updates.</p>
          </div>
          <Link
            to="/student/complaints"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All ({studentComplaints.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {studentComplaints.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No complaints filed yet. Click "File New Complaint" above to register an issue.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Subject / Issue</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Personnel</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentComplaints.slice(0, 5).map((c) => {
                  const ticketId = c.Complaint_ID || c.complaint_id;
                  const catName = c.Category_Name || c.category_name;
                  const title = c.Title || c.title || c.description;
                  const status = c.Status || c.status;
                  const assignedStaff = c.Assigned_Staff || c.assigned_staff || 'Pending Assignment';

                  return (
                    <tr key={ticketId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-blue-600">
                        <button
                          onClick={() => handleCopyTicket(ticketId)}
                          title="Click to copy Ticket ID"
                          className="hover:underline flex items-center gap-1 group/btn"
                        >
                          <span>{ticketId}</span>
                          <Copy className="w-3 h-3 text-slate-400 group-hover/btn:text-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </button>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {catName}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-900 font-medium">
                        {title}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={status} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {assignedStaff}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/student/complaints/${ticketId}`}
                          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded"
                        >
                          Track &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
