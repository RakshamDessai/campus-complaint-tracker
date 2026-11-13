import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import { Wrench, CheckCircle2, Clock, AlertTriangle, Play, Check, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StaffQueueDashboard() {
  const { complaints, updateStatus, loading: contextLoading } = useComplaints();
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');

  const isLoading = authLoading || contextLoading;

  const staffId = profile?.staff_id;
  const staffDisplayName = profile
    ? `${profile.first_name} ${profile.last_name} (${profile.designation})`
    : 'Vinod Sawant (Senior Electrician)';

  // Staff queue: tickets assigned to this staff member with status not Resolved
  const activeQueue = complaints.filter(t => {
    const notResolved = t.Status !== 'Resolved';
    // If we have a real staffId, filter by assignment; otherwise show all unresolved
    if (staffId) return notResolved && (t.Assigned_Staff_ID === staffId || t.assigned_staff_id === staffId);
    return notResolved;
  });

  const filteredQueue = activeQueue.filter(t => {
    if (filterPriority === 'All') return true;
    return t.Priority === filterPriority;
  });

  const handleStartWork = (ticketId) => {
    updateStatus(ticketId, 'In-Progress', 'Technician arrived on site and initiated diagnostics.', staffDisplayName);
    toast.info(
      `Work order #${ticketId} is now In-Progress. Diagnostic protocol initiated and resident notified via SMS timeline.`,
      {
        title: `Work Order #${ticketId} Activated`,
        badge: 'On-Site Diagnostic'
      }
    );
  };

  const handleResolve = () => {
    if (!selectedTicket) return;
    const ticketId = selectedTicket.Complaint_ID;
    updateStatus(
      ticketId,
      'Resolved',
      resolutionNote.trim() || 'Work inspected and completed according to standard maintenance checklist.',
      staffDisplayName
    );
    toast.success(
      `Work order #${ticketId} verified as Resolved. Audit record timestamped and resident prompted for satisfaction rating.`,
      {
        title: `Ticket #${ticketId} Resolved & Closed`,
        badge: 'Resolution Complete'
      }
    );
    setSelectedTicket(null);
    setResolutionNote('');
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-1">
            <span>Maintenance Operations</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-600" />
            <span>Staff Maintenance Queue</span>
          </h1>
          <p className="text-xs text-slate-500">
            Active technician console for assigned Electrical, Plumbing, and Infrastructure tickets.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200">
            Logged in as: <strong>{staffDisplayName}</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards with hover lift animation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm card-hover">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Active Work Orders
          </span>
          <span className="text-2xl font-extrabold text-slate-900">{activeQueue.length}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Pending maintenance action</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm card-hover">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-1">
            In-Progress
          </span>
          <span className="text-2xl font-extrabold text-blue-600">
            {activeQueue.filter(t => t.Status === 'In-Progress').length}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Currently being serviced</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm card-hover">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block mb-1">
            Completed Archive
          </span>
          <Link to="/staff/history" className="text-2xl font-extrabold text-emerald-600 hover:underline block">
            {complaints.filter(t => t.Status === 'Resolved').length}
          </Link>
          <span className="text-[11px] text-slate-400 block mt-1">Click to view completed archive</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">Filter by Priority:</span>
        <div className="flex gap-1.5 text-xs font-semibold">
          {['All', 'Critical', 'High', 'Medium', 'Low'].map(p => (
            <button
              key={p}
              onClick={() => {
                setFilterPriority(p);
                const count = p === 'All' ? activeQueue.length : activeQueue.filter(t => t.Priority === p).length;
                toast.info(`Filtered active queue for "${p}" priority tickets. Showing ${count} task(s).`, {
                  title: `Queue Priority: ${p}`,
                  badge: 'Filter'
                });
              }}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterPriority === p ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket Queue List */}
      <div className="space-y-4">
        {filteredQueue.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            No work orders in queue matching this filter.
          </div>
        ) : (
          filteredQueue.map((ticket) => (
            <div
              key={ticket.Complaint_ID}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-blue-300 transition-all card-hover"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-blue-600">{ticket.Complaint_ID}</span>
                  <StatusBadge status={ticket.Status} />
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    ticket.Priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
                    ticket.Priority === 'High' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {ticket.Priority} Priority
                  </span>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                    {ticket.Category_Name}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>SLA Due: {ticket.SLA_Due}</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">{ticket.Title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ticket.Description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                  <span>Student: <strong>{ticket.Student_Name}</strong></span>
                  <span>Location: <strong>{ticket.Room_No}</strong></span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/staff/ticket/${ticket.Complaint_ID}`}
                    className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs px-3.5 py-1.5 rounded-lg border border-blue-200 transition-colors shadow-sm"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Work Order Console &rarr;</span>
                  </Link>

                  {ticket.Status !== 'In-Progress' && (
                    <button
                      onClick={() => handleStartWork(ticket.Complaint_ID)}
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Work</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Resolve Work Order</span>
                  </button>
                </div>

                <Link
                  to={`/student/complaints/${ticket.Complaint_ID}/timeline`}
                  className="text-xs font-semibold text-slate-500 hover:text-blue-600 hover:underline"
                >
                  Live Timeline &rarr;
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Frame 12: Resolution Modal with Smooth Spring Entrance & Backdrop Blur */}
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
              className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 z-10"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Official Resolution Sign-Off</span>
                  <h3 className="font-bold text-slate-900 text-base">Complete Work Order Resolution</h3>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)} 
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 font-bold transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-xs text-slate-500">
                Provide official technician notes for ticket <strong>{selectedTicket.Complaint_ID}</strong> ({selectedTicket.Title}).
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Technician Work Report &amp; Actions Taken
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Inspected circuit, replaced burned capacitor with new 2.5uF unit. Verified full speed operation."
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolve}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95"
                >
                  Confirm Resolution
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
