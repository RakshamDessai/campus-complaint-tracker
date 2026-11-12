import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useComplaints } from '../context/ComplaintContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import { Building, Users, AlertTriangle, UserPlus, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WardenHostelDashboard() {
  const { complaints, staffMembers, assignStaffToTicket } = useComplaints();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(window.location.search);
  const [selectedTicket, setSelectedTicket] = useState(() => {
    if (searchParams.get('modal') === 'assign') {
      return complaints.find(t => t.Status === 'Open') || complaints[0];
    }
    return null;
  });
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [activeHostelFilter, setActiveHostelFilter] = useState('All');

  // Filter complaints
  const filteredComplaints = complaints.filter(t => {
    if (activeHostelFilter === 'Mandovi') return t.Room_No.includes('Mandovi') || t.Hostel_ID === 'H1';
    if (activeHostelFilter === 'Zuari') return t.Room_No.includes('Zuari') || t.Hostel_ID === 'H2';
    return true;
  });

  const unassigned = filteredComplaints.filter(t => t.Status === 'Open');
  const escalations = filteredComplaints.filter(t => t.Is_Escalated || t.Status === 'Escalated');

  const handleAssignSubmit = () => {
    if (!assignedStaffId || !selectedTicket) return;
    const ticketId = selectedTicket.Complaint_ID;
    const staff = staffMembers.find(s => s.Staff_ID === assignedStaffId);
    assignStaffToTicket(ticketId, assignedStaffId, 'Hostel Warden Mahesh Bhandari');
    toast.success(
      `Dispatched ${staff?.First_Name || 'technician'} ${staff?.Last_Name || ''} (${staff?.Designation || 'Maintenance'}) to ticket #${ticketId}. Priority dispatch registered on duty roster.`,
      {
        title: `Technician Dispatched • #${ticketId}`,
        badge: 'Roster Dispatch'
      }
    );
    setSelectedTicket(null);
    setAssignedStaffId('');
  };

  return (
    <div className="space-y-6">
      
      {/* Hostel Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <Building className="w-3.5 h-3.5" />
            <span>Hostel Administration Desk</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Campus Hostel Grievance Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Supervising: Mandovi Hostel (Boys Block A), Zuari Hostel, Netravati Hostel.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/warden/escalations"
            className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{escalations.length} SLA Escalation Alert(s)</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Unassigned (Needs Staff)
          </span>
          <span className="text-2xl font-extrabold text-amber-600">{unassigned.length}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Pending dispatch action</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-1">
            In-Progress Work Orders
          </span>
          <span className="text-2xl font-extrabold text-blue-600">
            {filteredComplaints.filter(t => t.Status === 'In-Progress').length}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Technicians actively on-site</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block mb-1">
            Resolved Hostel Tickets
          </span>
          <span className="text-2xl font-extrabold text-emerald-600">
            {filteredComplaints.filter(t => t.Status === 'Resolved').length}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Closed successfully</span>
        </div>
      </div>

      {/* Hostel Tab Filters */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">Filter Hostel:</span>
        <div className="flex gap-1.5 text-xs font-semibold">
          {['All', 'Mandovi', 'Zuari'].map(h => (
            <button
              key={h}
              onClick={() => setActiveHostelFilter(h)}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeHostelFilter === h ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {h} Hostel
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Hostel Complaints Register</h2>
          <span className="text-xs text-slate-400">{filteredComplaints.length} Total Complaints</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Personnel</th>
                <th className="py-3 px-4 text-right">Dispatch Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.map(t => (
                <tr key={t.Complaint_ID} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    {t.Complaint_ID}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 block">{t.Student_Name}</span>
                    <span className="text-[11px] text-slate-400">{t.Room_No}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate font-medium">
                    {t.Title}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {t.Category_Name}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={t.Status} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {t.Assigned_Staff || 'Unassigned'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {t.Status === 'Open' ? (
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-2.5 py-1 rounded text-xs transition-colors shadow-sm"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Assign Staff</span>
                      </button>
                    ) : (
                      <Link
                        to={`/student/complaints/${t.Complaint_ID}`}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        Inspect &rarr;
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Frame 15: Staff Assignment Modal with Spring Motion */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTicket(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 z-10"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase">Technician Dispatch</span>
                  <h3 className="font-bold text-slate-900 text-base">Assign Maintenance Staff</h3>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)} 
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Select technician to dispatch for <strong>{selectedTicket.Complaint_ID}</strong> ({selectedTicket.Category_Name} • {selectedTicket.Room_No}).
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Available Technicians</label>
                <select
                  value={assignedStaffId}
                  onChange={e => setAssignedStaffId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Choose Specialized Technician --</option>
                  {staffMembers.filter(s => s.Role === 'Staff').map(s => (
                    <option key={s.Staff_ID} value={s.Staff_ID}>
                      {s.First_Name} {s.Last_Name} — {s.Designation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignSubmit}
                  disabled={!assignedStaffId}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95 shadow-sm"
                >
                  Dispatch Work Order
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
