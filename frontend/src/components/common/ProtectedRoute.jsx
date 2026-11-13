import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute
 * Redirects unauthenticated users to "/" and users whose role is not in
 * allowedRoles also to "/".
 *
 * @param {{ children: React.ReactNode, allowedRoles?: string[] }} props
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { session, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!session) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;

  return children;
}
