import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="container text-center" style={{ marginTop: '5rem' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!user) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but incorrect role
    return (
      <div className="container text-center animate-fade-in" style={{ marginTop: '5rem' }}>
        <h2 className="text-gradient">Access Denied</h2>
        <p className="text-muted">You don't have permission to view this page.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
