import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useComplaints } from '../context/ComplaintContext';
import StatusBadge from '../components/common/StatusBadge';
import { 
  ArrowLeft, 
  Wrench, 
  Clock, 
  User, 
  Building, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  FileCheck,
  Package
} from 'lucide-react';

export default function StaffTicketAction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { complaints, updateStatus } = useComplaints();

  const searchParams = new URLSearchParams(window.location.search);
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('modal') === 'resolve');
  const [resolutionNote, setResolutionNote] = useState('');
  const [partsUsed, setPartsUsed] = useState('');

  const ticket = complaints.find(c => c.Complaint_ID === id) || complaints[0];

  const handleStartWork = () => {
    updateStatus(ticket.Complaint_ID, 'In-Progress', 'Technician arrived on-site and initiated active diagnostics.', 'Vinod Sawant (Senior Electrician)');
  };

  const handleCompleteResolution = (e) => {
    e.preventDefault();
    const finalNote = partsUsed 
      ? `${resolutionNote.trim()} | Parts Replaced: ${partsUsed.trim()}`
      : resolutionNote.trim();

    updateStatus(
      ticket.Complaint_ID,
      'Resolved',
      finalNote || 'Issue repaired, tested, and verified according to standard maintenance checklist.',
      'Vinod Sawant (Senior Electrician)'
    );
    setIsModalOpen(false);
    navigate('/staff/history');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      
      {/* Back button */}
      <div>
        <Link to="/staff" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Staff Queue
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Technician Action Console
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Work Order #{ticket.Complaint_ID}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={ticket.Status} />
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              ticket.Priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
              ticket.Priority === 'High' ? 'bg-amber-100 text-amber-800' :
              'bg-slate-100 text-slate-700'
            }`}>
              {ticket.Priority} Priority
            </span>
          </div>
        </div>
      </div>

      {/* Ticket Details Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{ticket.Title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Category: <strong>{ticket.Category_Name}</strong></p>
          </div>
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-600 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>SLA Due: <strong>{ticket.SLA_Due}</strong></span>
          </div>
        </div>

        {/* Resident & Location Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Student Resident</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{ticket.Student_Name}</span>
            <span className="text-slate-500 text-[11px]">Roll: {ticket.Student_ID}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Location</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{ticket.Room_No}</span>
            <span className="text-slate-500 text-[11px]">Hostel Block</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Assigned Technician</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{ticket.Assigned_Staff || 'Self Assigned'}</span>
            <span className="text-slate-500 text-[11px]">Electrical &amp; Maintenance</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Date Lodged</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{ticket.Created_At}</span>
            <span className="text-slate-500 text-[11px]">Online Student Portal</span>
          </div>
        </div>

        {/* Issue Statement */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Grievance Statement</span>
          <p className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
            {ticket.Description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {ticket.Status !== 'In-Progress' && ticket.Status !== 'Resolved' && (
              <button
                onClick={handleStartWork}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-all card-hover"
              >
                <Play className="w-4 h-4" />
                <span>Start Work Order (In-Progress)</span>
              </button>
            )}

            {ticket.Status !== 'Resolved' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-all card-hover"
              >
                <FileCheck className="w-4 h-4" />
                <span>Complete Resolution</span>
              </button>
            )}
          </div>

          <Link
            to={`/student/complaints/${ticket.Complaint_ID}/timeline`}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>Inspect Live Status Timeline &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Frame 12: Staff Resolution Modal with Spring Animation */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 z-10"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Work Order Sign-Off</span>
                  <h3 className="text-base font-bold text-slate-900">Sign Off Work Order Completion</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCompleteResolution} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    1. Technician Repair Report
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Describe repair actions taken (e.g. Disassembled motor assembly, replaced burned 2.5uF capacitor, re-anchored safety pin)..."
                    className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    2. Replacement Parts / Inventory Utilized (Optional)
                  </label>
                  <input
                    type="text"
                    value={partsUsed}
                    onChange={(e) => setPartsUsed(e.target.value)}
                    placeholder="e.g. 1x Capacitor 2.5uF, 2x M4 Screws"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900">
                  <p className="font-semibold mb-0.5">Verification Checklist:</p>
                  <p className="text-[11px] text-emerald-700">✓ Physical repair inspected and verified safe for student use.</p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95"
                  >
                    Submit &amp; Mark Resolved
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
