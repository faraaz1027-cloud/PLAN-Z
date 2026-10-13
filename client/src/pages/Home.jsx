import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getDashboardPath } from '../utils/dashboardPath';

const Home = () => {
  const { user } = useContext(AuthContext);
  const dashboardPath = getDashboardPath(user?.role);

  return (
    <div className="container animate-fade-in" style={{ marginTop: '4rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>
        Discover the Best <span className="text-gradient">Events</span>
      </h1>
      <p className="text-muted" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
        PLAN-Z is your all-in-one platform for finding, booking, and managing events. 
        Join thousands of attendees and organizers today.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/events" className="btn btn-primary">Browse Events</Link>
        {user ? (
          <Link to={dashboardPath} className="btn btn-outline">Go to Dashboard</Link>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline">Log In</Link>
            <Link to="/register" className="btn btn-outline">Create an Account</Link>
          </>
        )}
      </div>

      <div className="glass-panel" style={{ marginTop: '4rem', padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Features</h3>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ flex: '1 1 300px', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Seamless Booking</h4>
            <p className="text-muted">Book your favorite events with just a few clicks.</p>
          </div>
          <div style={{ flex: '1 1 300px', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '0.5rem' }}>Event Merchandise</h4>
            <p className="text-muted">Support organizers by purchasing exclusive merch.</p>
          </div>
          <div style={{ flex: '1 1 300px', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            <h4 style={{ color: 'var(--accent-tertiary)', marginBottom: '0.5rem' }}>Organizer Dashboard</h4>
            <p className="text-muted">Powerful tools to manage your attendees and sales.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;