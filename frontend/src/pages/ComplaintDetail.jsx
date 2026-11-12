import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useComplaints } from '../context/ComplaintContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import { ArrowLeft, Clock, ShieldCheck, User, Building, AlertTriangle, Star, CheckCircle, ArrowRight } from 'lucide-react';

export default function ComplaintDetail() {
  const { id } = useParams();
  const { complaints, timelines, submitFeedback, feedbacks } = useComplaints();
  const { toast } = useToast();

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
    toast.success(`Thank you! Your ${rating}-star quality rating has been recorded.`, 'Feedback Saved');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      
      {/* Back button & Frame Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <Link to="/student/complaints" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Complaints
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Grievance Detail &amp; Inspection
            </span>
          </div>
        </div>

        {/* Shortcut to Live Status Timeline */}
        <Link
          to={`/student/complaints/${complaint.Complaint_ID}/timeline`}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all card-hover"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Open Full Timeline &rarr;</span>
        </Link>
      </div>

      {/* Ticket Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
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
            <span className="font-semibold text-slate-800 font-mono">{complaint.SLA_Due}</span>
          </div>
        </div>

        {/* Animated Resolution Progress Tracker Bar */}
        <div className="pt-1 pb-1">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <span>Resolution Progress:</span>
              <strong className="text-blue-600">
                {complaint.Status === 'Resolved' ? '100% (Completed)' :
                 complaint.Status === 'In-Progress' ? '65% (Active Diagnostics & Repair)' :
                 complaint.Status === 'Assigned' ? '35% (Technician Dispatched)' :
                 '10% (Queued for Assignment)'}
              </strong>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Status: {complaint.Status}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: complaint.Status === 'Resolved' ? '100%' :
                       complaint.Status === 'In-Progress' ? '65%' :
                       complaint.Status === 'Assigned' ? '35%' : '10%'
              }}
              transition={{ duration: 0.85, ease: "easeOut" }}
              className={`h-full rounded-full transition-all ${
                complaint.Status === 'Resolved' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                complaint.Status === 'In-Progress' ? 'bg-gradient-to-r from-blue-600 to-indigo-500' :
                complaint.Status === 'Assigned' ? 'bg-gradient-to-r from-indigo-500 to-purple-500' :
                'bg-gradient-to-r from-amber-500 to-yellow-400'
              }`}
            />
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Category</span>
            <span className="font-bold text-slate-800 block mt-0.5">{complaint.Category_Name}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Staff</span>
            <span className="font-bold text-slate-800 block mt-0.5">{complaint.Assigned_Staff || 'Pending Assignment'}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Location</span>
            <span className="font-bold text-slate-800 block mt-0.5">{complaint.Room_No}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Priority</span>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
              complaint.Priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
              complaint.Priority === 'High' ? 'bg-amber-100 text-amber-800' :
              'bg-slate-100 text-slate-700'
            }`}>
              {complaint.Priority}
            </span>
          </div>
        </div>

        {/* Description Body */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700 block mb-1">Grievance Description</span>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            {complaint.Description}
          </p>
        </div>

        {/* Official Resolution Note */}
        {complaint.Resolution_Note && (
          <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 text-xs text-emerald-900 animate-fade-in">
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 animate-scale-in">
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
              
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-125 transition-transform"
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

      {/* Mini Timeline Preview with Link to Frame 09 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Recent Status Updates</span>
          </h3>
          <Link
            to={`/student/complaints/${complaint.Complaint_ID}/timeline`}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>View Full Timeline &rarr;</span>
          </Link>
        </div>

        <div className="space-y-3">
          {existingTimeline.slice(0, 3).map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-bold text-slate-800">{step.status}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{step.timestamp}</span>
                </div>
                <p className="text-slate-600">{step.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
