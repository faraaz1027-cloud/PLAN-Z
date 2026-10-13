import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Merchandise = () => {
  const [events, setEvents] = useState([]);
  const [merchandiseMap, setMerchandiseMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventsAndMerch = async () => {
      try {
        const eventsRes = await API.get('/events');
        setEvents(eventsRes.data);
        
        const merchMap = {};
        for (let event of eventsRes.data) {
          const merchRes = await API.get(`/merchandise/event/${event._id}`);
          if (merchRes.data.length > 0) {
            merchMap[event._id] = merchRes.data;
          }
        }
        setMerchandiseMap(merchMap);
        setLoading(false);
      } catch (err) {
        setError('Failed to load merchandise.');
        setLoading(false);
      }
    };

    fetchEventsAndMerch();
  }, []);

  const handleAddToCart = async (merchId, quantity) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'attendee') {
      alert('Only attendees can add merchandise to cart.');
      return;
    }

    try {
      await API.post('/cart', { merchandiseId: merchId, quantity });
      alert('Added to cart successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  if (loading) return <div className="container text-center" style={{ marginTop: '5rem' }}><h2>Loading merchandise...</h2></div>;

  return (
    <div className="container animate-fade-in">
      <h2 style={{ marginBottom: '2rem', fontSize: '2.5rem' }}>
        Event <span className="text-gradient">Merchandise</span>
      </h2>

      {error && <div className="error-msg">{error}</div>}

      {Object.keys(merchandiseMap).length === 0 ? (
        <p className="text-muted">No merchandise available at the moment.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {events.map((event) => {
            const merchItems = merchandiseMap[event._id];
            if (!merchItems) return null;

            return (
              <div key={event._id} className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                  <Link to={`/events/${event._id}`} style={{ color: 'white' }}>{event.title}</Link> Merch
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  {merchItems.map(item => (
                    <div key={item._id} style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{item.name}</h4>
                      <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>{item.description}</p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: '600', color: 'var(--accent-secondary)' }}>৳{item.price}</span>
                        <span style={{ fontSize: '0.9rem', color: item.stock > 0 ? '#10b981' : '#ef4444' }}>
                          {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>
                      
                      <button 
                        className="btn btn-outline" 
                        style={{ width: '100%' }}
                        disabled={item.stock === 0}
                        onClick={() => handleAddToCart(item._id, 1)}
                      >
                        {item.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Merchandise;
