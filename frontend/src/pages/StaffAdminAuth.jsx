import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { staffSignIn } from '../lib/auth';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Wrench, Lock, Mail, ArrowLeft, Shield, Eye, EyeOff, Sparkles, Building, Crown } from 'lucide-react';

const DEMO_STAFF_ACCOUNTS = {
  Warden: [
    { name: 'Sunita Borkar', label: 'Mandovi Hostel Warden', email: 'sunita.borkar@campus.edu' },
    { name: 'Prakash Fernandes', label: 'Zuari Hostel Warden', email: 'prakash.fernandes@campus.edu' },
  ],
  Staff: [
    { name: 'Anil Pai', label: 'Senior Electrician', email: 'anil.pai@campus.edu' },
    { name: 'Joseph Dias', label: 'Plumbing Lead', email: 'joseph.dias@campus.edu' },
  ],
  Admin: [
    { name: 'Rajesh Gawas', label: 'Campus Administrator', email: 'rajesh.gawas@campus.edu' },
  ],
};

export default function StaffAdminAuth() {
  const [role, setRole] = useState('Staff');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshAuth, loginUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter your official email and password.');
      return;
    }

    setLoading(true);

    const result = await staffSignIn(cleanEmail, cleanPassword);
    setLoading(false);

    if (result.error) {
      setError(result.error.message || 'Authentication failed. Please verify your email and password.');
      return;
    }

    const { profile, role: derivedRole } = result;
    const staffTitle = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Staff Member';

    if (loginUser && profile) {
      loginUser(result.session.token, profile, derivedRole);
    }
    await refreshAuth();

    toast.success(
      `Credential authentication verified. Session initialized for ${staffTitle} with ${derivedRole} clearance.`,
      {
        title: `Welcome to ${derivedRole} Portal`,
        badge: `${derivedRole} Access`
      }
    );

    if (derivedRole === 'Admin') navigate('/admin');
    else if (derivedRole === 'Warden') navigate('/warden');
    else navigate('/staff');
  };

  const demoAccounts = DEMO_STAFF_ACCOUNTS[role] || [];

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
              type="button"
              onClick={() => {
                setRole(r);
                setError('');
                // Pre-clear or populate corresponding demo
                if (DEMO_STAFF_ACCOUNTS[r]?.[0]) {
                  setEmail(DEMO_STAFF_ACCOUNTS[r][0].email);
                  setPassword('admin123');
                }
              }}
              className={`py-3 text-center transition-colors ${role === r ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {r === 'Staff' && '🔧 Staff'}
              {r === 'Warden' && '🛡️ Warden'}
              {r === 'Admin' && '👑 Admin'}
            </button>
          ))}
        </div>

        {/* Quick Demo Credentials Pill for Professor / Defense */}
        <div className="px-6 pt-4 pb-1">
          <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900 text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Quick Demo Accounts for {role}</span>
            </div>
            <div className={`grid ${demoAccounts.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickFill(acc.email, 'admin123')}
                  className="text-left bg-white hover:bg-indigo-100/70 border border-indigo-200 rounded-lg p-2 transition-colors text-[11px]"
                >
                  <span className="font-semibold text-slate-800 block truncate">{acc.name}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{acc.label}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-indigo-700">
              Default password for all staff: <code className="font-mono font-bold bg-indigo-100 px-1 py-0.5 rounded">admin123</code>
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
            <span className="font-semibold block mb-0.5">Active Role Mode: {role}</span>
            <span className="text-[11px] text-blue-700">
              {role === 'Staff' && 'Resolves assigned tickets (Electrician, Plumber, IT).'}
              {role === 'Warden' && 'Manages hostel complaints and dispatches technicians.'}
              {role === 'Admin' && 'Oversees all campus departments and configures SLA limits.'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email / Staff ID</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@campus.edu"
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Security PIN / Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 animate-fade-up">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm mt-2"
          >
            {loading ? 'Authenticating & Verifying...' : `Launch ${role} Console \u2192`}
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
