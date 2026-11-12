import React, { useState } from 'react';
import { X, Bell, AlertTriangle, CheckCircle2, Wrench, Clock, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';

export default function NotificationsDrawer({ isOpen, onClose }) {
  const { complaints } = useComplaints();
  const [filter, setFilter] = useState('All');
  const [clearedIds, setClearedIds] = useState([]);

  if (!isOpen) return null;

  // Build notifications from complaints
  const notifications = [
    {
      id: 'notif-1',
      type: 'escalation',
      title: 'SLA Escalation Warning',
      time: '15m ago',
      ticketId: 'CMP-2026-072',
      message: 'Wi-Fi AP disconnections in Mandovi Hostel exceeded 72h SLA. Auto-escalated to Chief Administration.',
      badge: 'Critical Escalation'
    },
    {
      id: 'notif-2',
      type: 'assigned',
      title: 'Technician Assigned',
      time: '45m ago',
      ticketId: 'CMP-2026-081',
      message: 'Plumber Kailash Prasad has been dispatched to Room B-204 for faucet water leakage repair.',
      badge: 'Work Order Active'
    },
    {
      id: 'notif-3',
      type: 'resolved',
      title: 'Complaint Resolved',
      time: '2h ago',
      ticketId: 'CMP-2026-068',
      message: 'Mess Hall cooler water filter successfully replaced. Please provide your student feedback rating.',
      badge: 'Resolved'
    },
    {
      id: 'notif-4',
      type: 'assigned',
      title: 'Scheduled Electrical Maintenance',
      time: '4h ago',
      ticketId: 'CMP-2026-084',
      message: 'Electrician Vinod Sawant scheduled room inspection for study desk light sparking.',
      badge: 'In-Progress'
    }
  ].filter(n => !clearedIds.includes(n.id));

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'Escalations') return n.type === 'escalation';
    if (filter === 'Assigned') return n.type === 'assigned';
    return true;
  });

  const handleClearAll = () => {
    setClearedIds(notifications.map(n => n.id));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed Backdrop Overlay with Fade-In Animation */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
      />

      {/* Slide-out Drawer from Right with Spring Slide Animation (Matching Frame 22) */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl pointer-events-auto flex flex-col justify-between transform transition-all ease-in-out duration-300 animate-slide-in-right">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center border border-blue-400/40">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white leading-tight">Campus Alerts &amp; Notifications</h2>
                <p className="text-[11px] text-slate-400">Real-time status updates and SLA events</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex gap-1.5 text-xs font-semibold">
              {['All', 'Escalations', 'Assigned'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${
                    filter === f ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[11px] text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Clear All
              </button>
            )}
          </div>

          {/* Notifications Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredNotifs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                All caught up! No unread notifications.
              </div>
            ) : (
              filteredNotifs.map(n => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border transition-all card-hover ${
                    n.type === 'escalation' ? 'bg-rose-50/70 border-rose-200 text-rose-950' :
                    n.type === 'resolved' ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' :
                    'bg-blue-50/70 border-blue-200 text-blue-950'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold flex items-center gap-1.5">
                      {n.type === 'escalation' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                      {n.type === 'assigned' && <Wrench className="w-3.5 h-3.5 text-blue-600" />}
                      {n.type === 'resolved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      <span>{n.title}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                  </div>
                  
                  <p className="text-xs text-slate-600 leading-relaxed mt-1 mb-2">
                    {n.message}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/50">
                    <span className="font-mono text-slate-500 font-semibold">{n.ticketId}</span>
                    <Link
                      to={`/student/complaints/${n.ticketId}`}
                      onClick={onClose}
                      className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>View Ticket</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-400 font-medium">
            Figma Frame 22: Notifications &amp; Alerts Drawer
          </div>

        </div>
      </div>
    </div>
  );
}
