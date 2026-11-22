import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSession, signOut } from '../lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession]   = useState(null);
  const [user, setUser]         = useState(null);     // { email }
  const [profile, setProfile]   = useState(null);     // student or staff row
  const [role, setRole]         = useState(null);     // 'Student'|'Staff'|'Warden'|'Admin'
  const [loading, setLoading]   = useState(true);

  async function checkAuth() {
    setLoading(true);
    try {
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
    } catch (e) {
      console.error('checkAuth error:', e);
      setSession(null);
      setUser(null);
      setProfile(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }

  function loginUser(token, userProfile, userRole) {
    const sess = { token, user: userProfile };
    setSession(sess);
    setUser(userProfile);
    setProfile(userProfile);
    setRole(userRole);
    setLoading(false);
  }

  async function logout() {
    try {
      await signOut();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
      setRole(null);
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, profile, role, loading, setSession, setProfile, setRole, refreshAuth: checkAuth, loginUser, logout }}>
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
