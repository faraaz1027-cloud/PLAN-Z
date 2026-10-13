import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo text-gradient">PLAN-Z</Link>
        
        <div className="navbar-links">
          <Link to="/events" className="navbar-link">Events</Link>
          <Link to="/merchandise" className="navbar-link">Merchandise</Link>
          
          {user ? (
            <>
              {user.role === 'attendee' && (
                <>
                  <Link to="/dashboard" className="navbar-link">My Dashboard</Link>
                  <Link to="/cart" className="navbar-link">Cart</Link>
                  <Link to="/complaints" className="navbar-link">Support</Link>
                </>
              )}
              {user.role === 'organizer' && (
                <>
                  <Link to="/organizer" className="navbar-link">Dashboard</Link>
                  <Link to="/complaints" className="navbar-link">Support</Link>
                </>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" className="navbar-link">Admin Panel</Link>
              )}
              
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Log In</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.2rem' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
