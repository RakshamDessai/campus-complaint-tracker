import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSession } from '../lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession]   = useState(null);
  const [user, setUser]         = useState(null);     // { email }
  const [profile, setProfile]   = useState(null);     // student or staff row
  const [role, setRole]         = useState(null);     // 'Student'|'Staff'|'Warden'|'Admin'
  const [loading, setLoading]   = useState(true);

  async function checkAuth() {
    setLoading(true);
    const result = await getSession();
    if (result && result.session) {
      setSession(result.session);
      setUser(result.user);
      setProfile(result.user);
      setRole(result.role);
    } else {
      setSession(null);
      setUser(null);
      setProfile(null);
      setRole(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, profile, role, loading, setSession, setProfile, setRole, refreshAuth: checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
