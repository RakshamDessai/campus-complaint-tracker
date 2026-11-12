import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { staffMembers } from '../data/mockData';
import { Wrench, Lock, Mail, ArrowLeft, Shield } from 'lucide-react';

export default function StaffAdminAuth() {
  const [role, setRole] = useState('Staff');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === 'Warden') navigate('/warden');
    else if (role === 'Admin') navigate('/admin');
    else navigate('/staff');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-campus-dark text-white p-6 relative">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-white mb-3 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Gateway
          </Link>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-400" />
            <span>Staff &amp; Admin Gateway</span>
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            Department maintenance personnel, hostel wardens, and admin officers.
          </p>
        </div>

        {/* Role Select Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-200 text-xs font-semibold">
          {['Staff', 'Warden', 'Admin'].map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`py-3 text-center transition-colors ${role === r ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
            <span className="font-semibold block mb-0.5">Active Role Mode: {role}</span>
            <span className="text-[11px] text-blue-700">
              {role === 'Staff' && 'Resolves assigned tickets (Electrician, Plumber, IT).'}
              {role === 'Warden' && 'Manages hostel complaints and assigns staff.'}
              {role === 'Admin' && 'Oversees all departments and configures SLA limits.'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email / Staff ID</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                defaultValue={
                  role === 'Staff' ? 'vinod.sawant@campus.edu' :
                  role === 'Warden' ? 'warden.mandovi@campus.edu' : 'admin.director@campus.edu'
                }
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Security PIN / Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                defaultValue="staffpass2026"
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-campus-primary hover:bg-campus-dark text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm mt-2"
          >
            Launch {role} Console &rarr;
          </button>
        </form>

        <div className="bg-slate-50 border-t border-slate-200 p-4 text-center text-xs text-slate-500">
          <span>Looking for student complaints? </span>
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Student Login
          </Link>
        </div>

      </div>
    </div>
  );
}
