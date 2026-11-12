import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useComplaints } from '../context/ComplaintContext';
import StatusBadge from '../components/common/StatusBadge';
import { ArrowLeft, Clock, ShieldCheck, User, Building, AlertTriangle, Star, CheckCircle } from 'lucide-react';

export default function ComplaintDetail() {
  const { id } = useParams();
  const { complaints, timelines, submitFeedback, feedbacks } = useComplaints();

  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const complaint = complaints.find(c => c.Complaint_ID === id) || complaints[0];
  
  const existingTimeline = timelines[complaint.Complaint_ID] || [
    { historyNum: 1, status: 'Open', timestamp: complaint.Created_At, user: `${complaint.Student_Name} (Student)`, note: 'Grievance lodged in student portal.' },
    { historyNum: 2, status: complaint.Status, timestamp: complaint.Updated_At, user: complaint.Assigned_Staff || 'Staff', note: 'Active ticket status.' }
  ];

  const existingFeedback = feedbacks[complaint.Complaint_ID];

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    submitFeedback(complaint.Complaint_ID, rating, comments);
    setFeedbackSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Back button */}
      <div>
        <Link to="/student/complaints" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Complaints
        </Link>
      </div>

      {/* Ticket Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-sm font-bold text-blue-600">{complaint.Complaint_ID}</span>
              <StatusBadge status={complaint.Status} />
              {complaint.Is_Escalated && (
                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> SLA BREACH ESCALATED
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900">{complaint.Title}</h1>
          </div>
          
          <div className="text-right text-xs">
            <span className="text-slate-400 block text-[11px]">Expected SLA Target</span>
            <span className="font-semibold text-slate-800">{complaint.SLA_Due}</span>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Category</span>
            <span className="font-semibold text-slate-800">{complaint.Category_Name}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Assigned Personnel</span>
            <span className="font-semibold text-slate-800">{complaint.Assigned_Staff || 'Pending Assignment'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Location</span>
            <span className="font-semibold text-slate-800">{complaint.Room_No}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Priority</span>
            <span className="font-semibold text-slate-800">{complaint.Priority}</span>
          </div>
        </div>

        {/* Description Body */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700 block mb-1">Grievance Description</span>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            {complaint.Description}
          </p>
        </div>

        {/* Official Resolution Note */}
        {complaint.Resolution_Note && (
          <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 text-xs text-emerald-900">
            <span className="font-bold block mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Official Technician Resolution Note:</span>
            </span>
            <p className="leading-relaxed">{complaint.Resolution_Note}</p>
          </div>
        )}
      </div>

      {/* Student Feedback Card (Visible when Resolved) */}
      {complaint.Status === 'Resolved' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>Student Satisfaction &amp; Quality Rating</span>
          </h2>

          {existingFeedback || feedbackSubmitted ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900 flex items-center justify-between">
              <div>
                <span className="font-bold block mb-1">Thank you! Your rating has been submitted:</span>
                <p className="italic">"{existingFeedback ? existingFeedback.comments : comments}"</p>
              </div>
              <div className="flex items-center gap-1 bg-white px-3 py-1 rounded border border-amber-300">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-sm">{existingFeedback ? existingFeedback.rating : rating} / 5 Stars</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-600">
                Please rate your satisfaction with the repair work and turnaround time:
              </p>
              
              {/* Star Selector */}
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">{rating} out of 5 Stars</span>
              </div>

              <div>
                <input
                  type="text"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Leave a brief comment (e.g. Fixed quickly and works properly!)..."
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Submit Quality Rating
              </button>
            </form>
          )}
        </div>
      )}

      {/* Live Status Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Live Status Timeline</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time history of all updates recorded for this grievance.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
            {existingTimeline.length} Updates Recorded
          </span>
        </div>

        {/* Timeline Items */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {existingTimeline.map((step, idx) => (
            <div key={idx} className="relative">
              {/* Dot */}
              <div className="absolute -left-[27px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              </div>

              {/* Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={step.status} />
                    <span className="font-semibold text-slate-800">Update #{step.historyNum}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{step.timestamp}</span>
                </div>
                <p className="text-slate-600 leading-relaxed mb-1">{step.note}</p>
                <span className="text-[11px] text-slate-400">Action recorded by: <strong>{step.user}</strong></span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Grievance status lifecycle: Open → Assigned → In-Progress → Resolved.
          </span>
        </div>

      </div>

    </div>
  );
}
