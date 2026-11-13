import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { studentSignIn, studentSignUp } from '../lib/auth';
import { apiRequest } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Phone, Home, ArrowLeft } from 'lucide-react';

export default function StudentAuth() {
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshAuth } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [hostelId, setHostelId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hostels, setHostels] = useState([]);

  // Fetch hostels from API on mount
  useEffect(() => {
    apiRequest('/lookups', 'GET')
      .then((data) => {
        if (data && data.hostels) {
          setHostels(data.hostels);
          if (data.hostels.length > 0) setHostelId(String(data.hostels[0].hostel_id));
        }
      })
      .catch((err) => console.error('Failed to load hostels:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegister) {
      const result = await studentSignUp({
        email,
        password,
        firstName,
        lastName,
        roomNo,
        hostelId: parseInt(hostelId),
      });
      setLoading(false);
      if (result.error) {
        setError(result.error.message || 'Registration failed. Please try again.');
        return;
      }
      await refreshAuth();
      toast.success(
        'Resident registration verified and linked to hostel. Welcome aboard!',
        { title: 'Registration Completed', badge: 'Resident Auth' }
      );
      navigate('/student');
    } else {
      const result = await studentSignIn(email, password);
      setLoading(false);
      if (result.error) {
        setError(result.error.message || 'Invalid credentials. Please try again.');
        return;
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
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-3 text-center transition-colors ${!isRegister ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/40' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-3 text-center transition-colors ${isRegister ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/40' : 'text-slate-500 hover:text-slate-700'}`}
          >
            New Student Register
          </button>
        </div>

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
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm mt-2"
          >
            {loading
              ? (isRegister ? 'Creating Account...' : 'Signing In...')
              : (isRegister ? 'Create Account & Enter Portal' : 'Login to Student Portal')}
          </button>
        </form>

        <div className="bg-slate-50 border-t border-slate-200 p-4 text-center text-xs text-slate-500">
          <span>Are you a maintenance staff or warden? </span>
          <Link to="/staff-login" className="text-blue-600 font-semibold hover:underline">
            Staff Login &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
