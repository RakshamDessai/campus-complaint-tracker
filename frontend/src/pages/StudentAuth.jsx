import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { studentSignIn, studentSignUp } from '../lib/auth';
import { apiRequest } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Home, ArrowLeft, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';

const DEFAULT_HOSTELS = [
  { hostel_id: 1, hostel_name: 'Mandovi Boys Hostel' },
  { hostel_id: 2, hostel_name: 'Zuari Boys Hostel' },
  { hostel_id: 3, hostel_name: 'Chapora Girls Hostel' },
];

export default function StudentAuth() {
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshAuth, loginUser } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [hostelId, setHostelId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hostels, setHostels] = useState(DEFAULT_HOSTELS);

  // Fetch live hostels from API on mount
  useEffect(() => {
    let isMounted = true;
    apiRequest('/lookups', 'GET')
      .then((data) => {
        if (!isMounted) return;
        if (data && Array.isArray(data.hostels) && data.hostels.length > 0) {
          setHostels(data.hostels);
          setHostelId(String(data.hostels[0].hostel_id));
        }
      })
      .catch((err) => console.warn('Using default hostels fallback:', err.message));
    return () => { isMounted = false; };
  }, []);

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (isRegister) {
      const cleanFirst = firstName.trim();
      const cleanLast = lastName.trim();
      const cleanRoom = roomNo.trim();
      const validHostel = parseInt(hostelId, 10) || 1;

      if (!cleanFirst || !cleanLast || !cleanRoom || !cleanEmail || !cleanPassword) {
        setError('Please fill in all registration fields.');
        setLoading(false);
        return;
      }
      if (cleanPassword.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }

      const result = await studentSignUp({
        email: cleanEmail,
        password: cleanPassword,
        firstName: cleanFirst,
        lastName: cleanLast,
        roomNo: cleanRoom,
        hostelId: validHostel,
      });
      setLoading(false);

      if (result.error) {
        setError(result.error.message || 'Registration failed. Please try again.');
        return;
      }

      if (loginUser && result.profile) {
        loginUser(result.session.token, result.profile, 'Student');
      }
      await refreshAuth();
      toast.success(
        'Resident registration verified and linked to hostel. Welcome aboard!',
        { title: 'Registration Completed', badge: 'Resident Auth' }
      );
      navigate('/student');
    } else {
      if (!cleanEmail || !cleanPassword) {
        setError('Please enter your email and password.');
        setLoading(false);
        return;
      }

      const result = await studentSignIn(cleanEmail, cleanPassword);
      setLoading(false);

      if (result.error) {
        setError(result.error.message || 'Invalid email or password. Please check your credentials.');
        return;
      }

      if (loginUser && result.profile) {
        loginUser(result.session.token, result.profile, 'Student');
      }
      await refreshAuth();
      toast.success(
        `Authenticated as resident ${result.profile?.first_name || ''} ${result.profile?.last_name || ''}. Active session initialized.`,
        { title: 'Welcome Back!', badge: 'Resident Auth' }
      );
      navigate('/student');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-campus-dark text-white p-6 relative">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-white mb-3 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Gateway
          </Link>
          <h2 className="text-xl font-bold">
            {isRegister ? 'Student Registration' : 'Student Portal Login'}
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            Access your grievance desk &amp; track registered complaints.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 text-sm font-semibold">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-3 text-center transition-colors ${!isRegister ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/40' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-3 text-center transition-colors ${isRegister ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/40' : 'text-slate-500 hover:text-slate-700'}`}
          >
            New Student Register
          </button>
        </div>

        {/* Quick Demo Credentials Pill for Professor / Evaluation */}
        {!isRegister && (
          <div className="px-6 pt-4 pb-1">
            <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Quick Demo Accounts (1-Click Fill)</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('raksham.dessai@campus.edu', 'password123')}
                  className="text-left bg-white hover:bg-amber-100/70 border border-amber-300 rounded-lg p-2 transition-colors text-[11px]"
                >
                  <span className="font-semibold text-slate-800 block truncate">👤 Raksham Dessai</span>
                  <span className="text-[10px] text-slate-500 block">Hostel A-204</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('simepurushkarchirag84@gmail.com', 'password123')}
                  className="text-left bg-white hover:bg-amber-100/70 border border-amber-300 rounded-lg p-2 transition-colors text-[11px]"
                >
                  <span className="font-semibold text-slate-800 block truncate">👤 Chirag S.</span>
                  <span className="text-[10px] text-slate-500 block">Hostel A-21</span>
                </button>
              </div>
              <p className="text-[10px] text-amber-700">
                Default password for all seed students: <code className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded">password123</code>
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isRegister && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Rahul"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Sharma"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hostel Block</label>
                  <select
                    value={hostelId}
                    onChange={(e) => setHostelId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    {hostels.map(h => (
                      <option key={h.hostel_id} value={h.hostel_id}>{h.hostel_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room No</label>
                  <input
                    type="text"
                    required
                    value={roomNo}
                    onChange={(e) => setRoomNo(e.target.value)}
                    placeholder="e.g. B-204"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Email ID</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@campus.edu"
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
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
            {loading
              ? (isRegister ? 'Creating Account & Hashing...' : 'Verifying & Signing In...')
              : (isRegister ? 'Create Account & Enter Portal' : 'Login to Student Portal')}
          </button>
        </form>

        <div className="bg-slate-50 border-t border-slate-200 p-4 text-center text-xs text-slate-500">
          <span>Are you a maintenance staff or warden? </span>
          <Link to="/staff-login" className="text-blue-600 font-semibold hover:underline">
            Staff / Warden Login &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
