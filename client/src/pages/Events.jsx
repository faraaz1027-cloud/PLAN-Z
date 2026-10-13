import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { minTicketPrice } from '../utils/tickets';

const Events = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', category: '', location: '', date: '' });

  const fetchEvents = async (overrideFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      Object.entries(overrideFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const res = await API.get(`/events?${params.toString()}`);
      setEvents(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (user?.role !== 'attendee') return setFavorites([]);
    try {
      const res = await API.get('/users/favorites');
      setFavorites(res.data.map((event) => event._id));
    } catch (err) {
      console.error('Failed to load favorites', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchEvents(filters);
  };

  const handleClear = () => {
    const empty = { search: '', category: '', location: '', date: '' };
    setFilters(empty);
    fetchEvents(empty);
  };

  const toggleFavorite = async (eventId) => {
    if (!user || user.role !== 'attendee') return alert('Please log in as an attendee to save favorites.');
    try {
      if (favorites.includes(eventId)) {
        await API.delete(`/users/favorites/${eventId}`);
        setFavorites(favorites.filter((id) => id !== eventId));
      } else {
        await API.post(`/users/favorites/${eventId}`);
        setFavorites([...favorites, eventId]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update favorites.');
    }
  };

  return (
    <div className="container animate-fade-in">
      <h2 style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>Upcoming <span className="text-gradient">Events</span></h2>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label className="form-label">Search</label>
          <input name="search" type="text" className="form-input" placeholder="Title or description" value={filters.search} onChange={handleFilterChange} />
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <label className="form-label">Category</label>
          <input name="category" type="text" className="form-input" placeholder="Technology" value={filters.category} onChange={handleFilterChange} />
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <label className="form-label">Location</label>
          <input name="location" type="text" className="form-input" placeholder="Dhaka" value={filters.location} onChange={handleFilterChange} />
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <label className="form-label">Date</label>
          <input name="date" type="date" className="form-input" value={filters.date} onChange={handleFilterChange} />
        </div>
        <button type="submit" className="btn btn-primary">Search / Filter</button>
        <button type="button" className="btn btn-outline" onClick={handleClear}>Clear</button>
      </form>

      {loading ? <div className="text-center" style={{ padding: '3rem' }}><h2>Loading events...</h2></div> :
       error ? <div className="error-msg">{error}</div> :
       events.length === 0 ? <p className="text-muted text-center" style={{ padding: '3rem' }}>No events found.</p> :
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {events.map((event) => (
          <div key={event._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <button onClick={() => toggleFavorite(event._id)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: favorites.includes(event._id) ? '#ef4444' : 'var(--text-muted)' }}>
              {favorites.includes(event._id) ? '♥' : '♡'}
            </button>
            <span style={{ background: 'rgba(99,102,241,.2)', color: 'var(--accent-primary)', padding: '.2rem .6rem', borderRadius: '20px', fontSize: '.8rem', fontWeight: 600, textTransform: 'uppercase', width: 'fit-content', marginBottom: '1rem' }}>{event.category || 'General'}</span>
            <h3 style={{ marginBottom: '.5rem', paddingRight: '2rem' }}>{event.title}</h3>
            <p className="text-muted" style={{ marginBottom: '1rem', flex: 1 }}>{event.description?.slice(0, 120)}...</p>
            <div style={{ marginBottom: '1.5rem', fontSize: '.9rem' }}>
              <div>📅 {event.date && !isNaN(new Date(event.date).getTime()) ? new Date(event.date).toLocaleDateString() : 'Date TBA'}</div>
              <div>📍 {[event.venue, event.location].filter(Boolean).join(', ') || 'Location TBA'}</div>
              <div style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>🎟️ From ৳{minTicketPrice(event.ticketTypes, event.price)}</div>
            </div>
            <Link to={`/events/${event._id}`} className="btn btn-outline" style={{ textAlign: 'center' }}>View Details</Link>
          </div>
        ))}
       </div>}
    </div>
  );
};

export default Events;
