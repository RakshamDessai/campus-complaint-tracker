import React, { useState } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import StatusBadge from '../components/common/StatusBadge';
import { Wrench, CheckCircle2, Clock, AlertTriangle, Play, Check, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StaffQueueDashboard() {
  const { complaints, updateStatus } = useComplaints();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');

  // Staff queue: tickets that are Open, Assigned, or In-Progress
  const activeQueue = complaints.filter(t => t.Status !== 'Resolved');

  const filteredQueue = activeQueue.filter(t => {
    if (filterPriority === 'All') return true;
    return t.Priority === filterPriority;
  });

  const handleStartWork = (ticketId) => {
    updateStatus(ticketId, 'In-Progress', 'Technician arrived on site and initiated diagnostics.', 'Vinod Sawant (Senior Electrician)');
  };

  const handleResolve = () => {
    if (!selectedTicket) return;
    updateStatus(
      selectedTicket.Complaint_ID,
      'Resolved',
      resolutionNote.trim() || 'Work inspected and completed according to standard maintenance checklist.',
      'Vinod Sawant (Senior Electrician)'
    );
    setSelectedTicket(null);
    setResolutionNote('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
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
            Logged in as: <strong>Vinod Sawant</strong> (Senior Electrician)
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Active Work Orders
          </span>
          <span className="text-2xl font-extrabold text-slate-900">{activeQueue.length}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Pending maintenance action</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-1">
            In-Progress
          </span>
          <span className="text-2xl font-extrabold text-blue-600">
            {activeQueue.filter(t => t.Status === 'In-Progress').length}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Currently being serviced</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block mb-1">
            Resolution History
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
              onClick={() => setFilterPriority(p)}
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
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-blue-300 transition-all"
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
                  {ticket.Status !== 'In-Progress' && (
                    <button
                      onClick={() => handleStartWork(ticket.Complaint_ID)}
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Work Order</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark as Resolved</span>
                  </button>
                </div>

                <Link
                  to={`/student/complaints/${ticket.Complaint_ID}`}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  View Details &amp; History &rarr;
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resolution Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Complete Work Order Resolution</h3>
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
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
