import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useComplaints } from '../context/ComplaintContext';
import StatusBadge from '../components/common/StatusBadge';
import { ArrowLeft, Clock, ShieldCheck, User, Building, AlertTriangle, CheckCircle, Star, Printer, Share2 } from 'lucide-react';

export default function LiveStatusTimelinePage() {
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
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <Link to={`/student/complaints/${complaint.Complaint_ID}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Complaint Detail
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Live Status Timeline &amp; Audit Trail
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Audit Trail &amp; Real-Time SLA Timeline
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print Audit Trail
          </button>
        </div>
      </div>

      {/* Ticket Banner with SLA Countdown Clock */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-mono text-xs font-bold bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded border border-blue-400/30">
              {complaint.Complaint_ID}
            </span>
            <StatusBadge status={complaint.Status} />
            <span className="text-xs text-slate-300 bg-white/10 px-2 py-0.5 rounded">
              {complaint.Category_Name}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">{complaint.Title}</h2>
          <p className="text-xs text-slate-300 mt-1">
            Resident: <strong>{complaint.Student_Name}</strong> ({complaint.Room_No}) &bull; Filed: {complaint.Created_At}
          </p>
        </div>

        {/* SLA Clock with Glow Animation */}
        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 text-right shrink-0">
          <span className="text-[11px] text-blue-300 font-semibold block uppercase tracking-wider">
            SLA Resolution Clock
          </span>
          <span className="text-xl font-extrabold font-mono text-emerald-400 block mt-0.5">
            Target: {complaint.SLA_Due}
          </span>
          <span className="text-[10px] text-slate-300 mt-0.5 flex items-center gap-1 justify-end">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Active Clock
          </span>
        </div>
      </div>

      {/* Interactive Timeline Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Step-by-Step Resolution Milestones</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable ledger of all actions performed by students, wardens, and technicians.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
            {existingTimeline.length} Milestone Events
          </span>
        </div>

        {/* Animated Timeline List */}
        <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {existingTimeline.map((step, idx) => {
            const isLast = idx === existingTimeline.length - 1;
            return (
              <div key={idx} className="relative group animate-fade-up">
                {/* Node Indicator with Glow on Active */}
                <div className={`absolute -left-[39px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isLast 
                    ? 'bg-blue-600 border-blue-200 ring-4 ring-blue-100 shadow-md text-white' 
                    : 'bg-white border-blue-600 text-blue-600'
                }`}>
                  {isLast ? (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                  )}
                </div>

                {/* Event Card with Motion */}
                <motion.div 
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.12, duration: 0.3 }}
                  whileHover={{ x: 4, transition: { duration: 0.15 } }}
                  className="bg-slate-50 hover:bg-white border border-slate-200/80 rounded-xl p-4 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={step.status} />
                      <span className="font-bold text-xs text-slate-900">
                        Milestone #{step.historyNum}: {step.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {step.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed mb-2">
                    {step.note}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/50">
                    <span>Authorized by: <strong>{step.user}</strong></span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      ✓ Logged &amp; Verified
                    </span>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Post-Resolution Rating Card */}
        {complaint.Status === 'Resolved' && (
          <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Student Quality Feedback (Post-Resolution)</span>
            </h4>

            {existingFeedback || feedbackSubmitted ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-center justify-between">
                <div>
                  <span className="font-bold block mb-0.5">Rating Submitted:</span>
                  <p className="italic">"{existingFeedback ? existingFeedback.comments : comments}"</p>
                </div>
                <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-amber-300">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-amber-900 text-sm">
                    {existingFeedback ? existingFeedback.rating : rating} / 5 Stars
                  </span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs text-slate-600">Rate the speed and quality of this repair:</p>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{rating} Stars</span>
                </div>
                <input
                  type="text"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Feedback notes for campus estate management..."
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Submit Satisfaction Rating
                </button>
              </form>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
