import React, { useState, useEffect } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { getStaffHistory } from '../lib/db';
import StatusBadge from '../components/common/StatusBadge';
import { History, CheckCircle2, Clock, Calendar, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StaffHistory() {
  const { complaints, feedbacks, loading: contextLoading } = useComplaints();
  const { profile, loading: authLoading } = useAuth();

  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const staffId = profile?.staff_id;

  useEffect(() => {
    let isMounted = true;
    if (staffId) {
      setHistoryLoading(true);
      getStaffHistory(staffId).then(res => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : (res?.data || []);
        setHistoryList(list);
      }).catch(err => {
        console.error('Error fetching staff history:', err);
      }).finally(() => {
        if (isMounted) setHistoryLoading(false);
      });
    }
    return () => { isMounted = false; };
  }, [staffId]);

  const isLoading = authLoading || (staffId ? historyLoading : contextLoading);

  // Show resolved/closed complaints from backend API; fallback to complaints context
  const resolvedTickets = historyList.length > 0
    ? historyList
    : complaints.filter(t => {
        const s = t.status || t.Status;
        return s === 'Resolved' || s === 'Closed';
      });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-600" />
            <span>Resolution History &amp; Completed Work Orders</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Archive of successfully resolved grievances across campus departments.
          </p>
        </div>
        <div className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{resolvedTickets.length} Total Resolved Orders</span>
        </div>
      </div>

      {/* Resolved List */}
      <div className="space-y-4">
        {resolvedTickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            No completed work orders yet. Resolved tickets will appear here.
          </div>
        ) : (
          resolvedTickets.map(ticket => {
            const ticketId = ticket.complaint_id || ticket.Complaint_ID;
            const feedback = feedbacks[ticketId] || feedbacks[ticket.Complaint_ID];
            return (
              <div key={ticketId} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-600">#{ticketId}</span>
                    <StatusBadge status={ticket.status || ticket.Status} />
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {ticket.category_name || ticket.Category_Name}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" /> Resolved: {ticket.updated_at || ticket.Updated_At}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{ticket.title || ticket.Title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{ticket.description || ticket.Description}</p>
                  
                  {/* Resolution Note */}
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900">
                    <span className="font-semibold block mb-0.5">Technician Resolution Report:</span>
                    <p>{ticket.resolution_note || ticket.Resolution_Note || 'Issue inspected, repaired, and confirmed functional.'}</p>
                    <span className="text-[11px] text-emerald-700 mt-1 block">Completed by: {ticket.assigned_staff || ticket.Assigned_Staff || 'Staff Technician'}</span>
                  </div>
                </div>

                {/* Student Feedback if provided */}
                {feedback && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-amber-900 block">Student Feedback:</span>
                      <p className="text-amber-800 italic">"{feedback.comments || 'Satisfied with the quick repair'}"</p>
                    </div>
                    <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-amber-200">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-amber-900 text-xs">{feedback.rating} / 5</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-xs text-slate-500 border-t border-slate-100">
                  <span>Location: <strong>{ticket.room_no || ticket.Room_No}</strong></span>
                  <Link to={`/student/complaints/${ticketId}`} className="text-blue-600 font-semibold hover:underline">
                    View Complete Audit Trail &rarr;
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
