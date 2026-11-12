import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  User, 
  Building2, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

export default function WelcomeGateway() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Banner */}
      <section className="bg-slate-900 text-white relative overflow-hidden py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-6">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>CAMPUS GRIEVANCE PORTAL</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Campus Complaint &amp; Grievance Tracker
          </h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg mb-8 leading-relaxed font-normal">
            A single platform to lodge, track, and resolve campus issues across Hostel, Mess, Infrastructure, IT, and Academics.
          </p>

          <div className="flex flex-wrap justify-center gap-3 text-xs font-medium text-slate-300">
            <span className="bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Fast Issue Resolution
            </span>
            <span className="bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> Real-Time Status Tracking
            </span>
            <span className="bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Transparent Accountability
            </span>
          </div>
        </div>
      </section>

      {/* 3 Dedicated Role Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-16 relative z-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: Student Portal */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 flex flex-col justify-between hover:shadow-lg hover:border-blue-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 border border-blue-100">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Student Portal</h3>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                Lodge complaints for hostel rooms, electricity, plumbing, Wi-Fi, or mess food. Track real-time progress until resolved.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 mb-6">
                <li className="flex items-center gap-2">✔ Instant Ticket ID generation</li>
                <li className="flex items-center gap-2">✔ Step-by-step progress tracking</li>
                <li className="flex items-center gap-2">✔ Feedback &amp; resolution rating</li>
              </ul>
            </div>
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm"
            >
              <span>Student Login / Register</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Staff & Warden Portal */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 flex flex-col justify-between hover:shadow-lg hover:border-blue-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 border border-indigo-100">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Staff &amp; Warden Desk</h3>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                View assigned work orders, update repair progress, add resolution notes, and monitor hostel-wide grievances.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 mb-6">
                <li className="flex items-center gap-2">✔ Assigned complaint queue</li>
                <li className="flex items-center gap-2">✔ Progress updates &amp; notes</li>
                <li className="flex items-center gap-2">✔ Staff re-assignment by warden</li>
              </ul>
            </div>
            <Link
              to="/staff-login"
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm"
            >
              <span>Staff / Warden Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: Administration */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 flex flex-col justify-between hover:shadow-lg hover:border-blue-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-5 border border-slate-200">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Campus Administration</h3>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                Campus-wide complaint trends, department performance monitoring, average resolution times, and staff management.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 mb-6">
                <li className="flex items-center gap-2">✔ Department-wise complaint counts</li>
                <li className="flex items-center gap-2">✔ Average resolution time trends</li>
                <li className="flex items-center gap-2">✔ Escalated issue alerts</li>
              </ul>
            </div>
            <Link
              to="/admin"
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm"
            >
              <span>Admin Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* Footer Info */}
      <footer className="mt-auto border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p className="font-medium text-slate-600 mb-1">
          Campus Complaint &amp; Grievance Tracker — DBMS Mini-Project
        </p>
        <p>Chirag Simepurushkar (24B-CO-015) • Raksham R. Dessai (24B-CO-019) • Aayushi Prabhu (24B-CO-001)</p>
      </footer>
    </div>
  );
}
