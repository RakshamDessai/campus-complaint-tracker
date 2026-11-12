import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home, Clock, MapPin, Tag } from 'lucide-react';

export default function ComplaintSuccess() {
  const location = useLocation();
  const ticketData = location.state || {
    ticketId: 'CMP-2026-104',
    title: 'Water Leakage in Bathroom',
    category: 'Plumbing',
    location: 'Hostel 1, Room 204'
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-8 text-center space-y-6">
        
        {/* Animated Check */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
            GRIEVANCE SUCCESSFULLY REGISTERED
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 font-mono">
            Ticket #{ticketData.ticketId}
          </h1>
          <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
            Your grievance has been successfully submitted. You will receive real-time updates as your ticket is processed.
          </p>
        </div>

        {/* Ticket Details Summary Card */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-xs space-y-2">
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Subject:</span>
            <span className="font-semibold text-slate-800">{ticketData.title}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Category:</span>
            <span className="font-semibold text-slate-800">{ticketData.category}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Location:</span>
            <span className="font-semibold text-slate-800">{ticketData.location || 'Hostel Room'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Initial Status:</span>
            <span className="font-semibold text-amber-600">Open (Pending Assignment)</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Expected Resolution Time:</span>
            <span className="font-semibold text-blue-600">{ticketData.slaDays || 2} Business Days</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/student"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Student Dashboard</span>
          </Link>
          <Link
            to={`/student/complaints/${ticketData.ticketId}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
          >
            <span>Live Tracking &amp; Timeline</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
