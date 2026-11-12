import React from 'react';
import { Link } from 'react-router-dom';
import { useComplaints } from '../context/ComplaintContext';
import StatusBadge from '../components/common/StatusBadge';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Building, 
  Phone,
  FileText
} from 'lucide-react';

export default function StudentDashboard() {
  const { complaints, currentUser } = useComplaints();
  
  // Complaints belonging to the active student
  const studentComplaints = complaints.filter(c => c.Student_ID === (currentUser.rollNo || '24B-CO-019'));
  
  const stats = {
    total: studentComplaints.length,
    active: studentComplaints.filter(c => c.Status === 'Open' || c.Status === 'Assigned' || c.Status === 'In-Progress').length,
    resolved: studentComplaints.filter(c => c.Status === 'Resolved').length,
    escalated: studentComplaints.filter(c => c.Is_Escalated || c.Status === 'Escalated').length
  };

  return (
    <div className="space-y-6">
      
      {/* Student Welcome Header Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <span>Student Resident</span> • <span>Roll No: {currentUser.rollNo || '24B-CO-019'}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {currentUser.name || 'Raksham Dessai'}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              {currentUser.hostel || 'Mandovi Hostel'} • Room {currentUser.room || 'B-204'}
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

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Filed
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.total}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Lifetime registered</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Active Queue
          </div>
          <div className="text-2xl font-extrabold text-blue-600">{stats.active}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Open / In-Progress</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resolved
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{stats.resolved}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Successfully fixed</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            SLA Escalated
          </div>
          <div className="text-2xl font-extrabold text-rose-600">{stats.escalated}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Under warden review</span>
        </div>

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
                {studentComplaints.slice(0, 5).map((c) => (
                  <tr key={c.Complaint_ID} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-600">
                      {c.Complaint_ID}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {c.Category_Name}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-900 font-medium">
                      {c.Title}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.Status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {c.Assigned_Staff || 'Pending Assignment'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/student/complaints/${c.Complaint_ID}`}
                        className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded"
                      >
                        Track &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
