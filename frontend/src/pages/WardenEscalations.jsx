import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import { AlertTriangle, Clock, ArrowUpRight, CheckCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WardenEscalations() {
  const { complaints, updateStatus, staffMembers, assignStaffToTicket, loading: contextLoading } = useComplaints();
  const { profile, role, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const isLoading = authLoading || contextLoading;

  const wardenHostelId = profile?.hostel_id ?? null;

  // Filter to escalated/critical tickets; if warden, further filter by hostel
  const baseComplaints = (wardenHostelId && role === 'Warden')
    ? complaints.filter(t => t.Hostel_ID === wardenHostelId || t.hostel_id === wardenHostelId)
    : complaints;

  const urgentTickets = baseComplaints.filter(
    t => t.Is_Escalated || t.Status === 'Escalated' || t.Priority === 'Critical' || (t.Priority === 'High' && t.Status !== 'Resolved')
  );

  const searchParams = new URLSearchParams(window.location.search);
  const [reassignedStaffId, setReassignedStaffId] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(() => {
    if (searchParams.get('modal') === 'reassign') {
      return urgentTickets[0] || complaints[0];
    }
    return null;
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEscalatePriority = async (ticketId) => {
    setIsUpdating(true);
    try {
      await updateStatus(ticketId, 'Escalated', 'Warden escalated priority due to SLA threshold breach.', 'Warden Desk');
      toast.warning(
        `Ticket #${ticketId} escalated to CRITICAL priority due to SLA turnaround overrun. Executive flag dispatched to Campus Administration console.`,
        {
          title: `Priority Escalated to Critical • #${ticketId}`,
          badge: 'SLA Breach Alert'
        }
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReassign = async () => {
    if (!reassignedStaffId || !selectedTicket) return;
    const ticketId = selectedTicket.Complaint_ID;
    const staff = staffMembers.find(s => s.Staff_ID === reassignedStaffId || s.staff_id === reassignedStaffId);
    setIsUpdating(true);
    try {
      await assignStaffToTicket(ticketId, reassignedStaffId, 'Hostel Warden (Emergency Reassignment)');
      toast.info(
        `Work order #${ticketId} emergency re-routed to ${staff?.First_Name || staff?.first_name || 'technician'} ${staff?.Last_Name || staff?.last_name || ''} (${staff?.Designation || staff?.designation || 'Maintenance Lead'}). Work order queue updated.`,
        {
          title: `Emergency Reassignment Completed`,
          badge: 'Workload Rebalance'
        }
      );
      setSelectedTicket(null);
      setReassignedStaffId('');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-rose-50 rounded-xl animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>URGENT HOSTEL ESCALATION MONITOR</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            SLA Escalations &amp; Critical Grievances
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Complaints requiring immediate administrative intervention, reassignment, or high-priority dispatch.
          </p>
        </div>

        <div className="text-right">
          <span className="text-3xl font-extrabold text-rose-600">{urgentTickets.length}</span>
          <span className="block text-xs font-semibold text-rose-700">Urgent Tickets</span>
        </div>
      </div>

      {/* Escalated Tickets List */}
      <div className="space-y-4">
        {urgentTickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No active escalations! All hostel grievances are progressing on schedule.
          </div>
        ) : (
          urgentTickets.map(ticket => (
            <div key={ticket.Complaint_ID} className="bg-white rounded-xl border-l-4 border-l-rose-500 border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-blue-600">{ticket.Complaint_ID}</span>
                  <StatusBadge status={ticket.Status} />
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                    PRIORITY: {ticket.Priority}
                  </span>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                    {ticket.Category_Name}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>SLA Due: <strong>{ticket.SLA_Due}</strong></span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">{ticket.Title}</h3>
                <p className="text-xs text-slate-600 mt-1">{ticket.Description}</p>
                <div className="text-xs text-slate-500 mt-2 flex flex-wrap gap-4">
                  <span>Student: <strong>{ticket.Student_Name}</strong> ({ticket.Room_No})</span>
                  <span>Assigned: <strong>{ticket.Assigned_Staff}</strong></span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2">
                <div className="flex gap-2">
                  {ticket.Status !== 'Escalated' && (
                    <button
                      onClick={() => handleEscalatePriority(ticket.Complaint_ID)}
                      disabled={isUpdating}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-1 disabled:opacity-60"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Trigger Priority Escalation</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors"
                  >
                    Reassign Technician
                  </button>
                </div>
                <Link
                  to={`/student/complaints/${ticket.Complaint_ID}`}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  Inspect Live Audit Timeline &rarr;
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Frame 17: Reassign Modal with Spring Animation */}
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
                  <span className="text-[10px] font-bold text-rose-600 uppercase">Emergency Override</span>
                  <h3 className="font-bold text-slate-900 text-base">Reassign Complaint Technician</h3>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)} 
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Select a specialized staff member to take over ticket <strong>{selectedTicket.Complaint_ID}</strong> ({selectedTicket.Category_Name}).
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Technician</label>
                <select
                  value={reassignedStaffId}
                  onChange={e => setReassignedStaffId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Staff Member --</option>
                  {staffMembers
                    .filter(s => s.Role === 'Staff' || s.role === 'Staff')
                    .map(s => (
                      <option key={s.Staff_ID || s.staff_id} value={s.Staff_ID || s.staff_id}>
                        {s.First_Name || s.first_name} {s.Last_Name || s.last_name} ({s.Designation || s.designation})
                      </option>
                    ))
                  }
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
                  onClick={handleReassign}
                  disabled={!reassignedStaffId || isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 shadow-sm"
                >
                  {isUpdating ? 'Reassigning...' : 'Confirm Reassignment'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
