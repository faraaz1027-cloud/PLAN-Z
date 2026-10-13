import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const statusBadge = (status) => {
  const paid = status === 'paid' || status === 'Completed';
  return { label: paid ? 'PAID' : String(status || 'pending').toUpperCase(), color: paid ? '#10b981' : '#f59e0b', bg: paid ? 'rgba(16,185,129,.2)' : 'rgba(245,158,11,.2)' };
};

const AttendeeDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [bookingsRes, favsRes, ordersRes] = await Promise.all([
        API.get('/bookings/my-bookings'),
        API.get('/users/favorites'),
        API.get('/orders/my-orders').catch(() => ({ data: [] })),
      ]);
      setBookings(bookingsRes.data);
      setFavorites(favsRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const removeFavorite = async (eventId) => {
    try {
      await API.delete(`/users/favorites/${eventId}`);
      setFavorites(favorites.filter((fav) => fav._id !== eventId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove favorite.');
    }
  };

  if (loading) return <div className="container text-center" style={{ marginTop: '5rem' }}><h2>Loading Dashboard...</h2></div>;

  return (
    <div className="container animate-fade-in">
      <h2 style={{ marginBottom: '2rem' }}>My <span className="text-gradient">Dashboard</span></h2>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {['bookings', 'favorites', 'orders'].map((tab) => (
          <button key={tab} className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab(tab)}>
            {tab === 'bookings' ? 'My Bookings' : tab === 'favorites' ? 'My Favorites' : 'Merchandise Orders'}
          </button>
        ))}
      </div>
      {error && <div className="error-msg">{error}</div>}

      {activeTab === 'bookings' && (
        bookings.length === 0 ? (
          <div className="glass-panel text-center" style={{ padding: '3rem' }}><h3>No bookings yet</h3><p className="text-muted" style={{ marginBottom: '2rem' }}>Start exploring events.</p><Link to="/events" className="btn btn-primary">Browse Events</Link></div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {bookings.map((booking) => {
              const badge = statusBadge(booking.paymentStatus);
              return (
                <div key={booking._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: '1 1 300px' }}>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '.5rem' }}><Link to={`/events/${booking.event?._id}`} style={{ color: 'var(--text-main)' }}>{booking.event?.title || 'Deleted Event'}</Link></h3>
                    <div style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginBottom: '.5rem' }}>📅 {booking.event?.date ? new Date(booking.event.date).toLocaleDateString() : 'N/A'} | 📍 {booking.event?.venue || booking.event?.location || 'N/A'}</div>
                    <div><span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>{booking.ticketType} Ticket</span><span className="text-muted" style={{ margin: '0 .5rem' }}>•</span><span>Qty: {booking.quantity}</span></div>
                    {booking.ticketCode && <div className="text-muted" style={{ fontSize: '.85rem', marginTop: '.4rem' }}>Digital Ticket: {booking.ticketCode}</div>}
                  </div>
                  <div style={{ textAlign: 'right', flex: '1 1 150px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '.5rem' }}>Total: ৳{booking.totalPrice}</div>
                    <div style={{ display: 'inline-block', background: badge.bg, color: badge.color, padding: '.3rem .8rem', borderRadius: '20px', fontSize: '.8rem', fontWeight: 600 }}>{badge.label} ({booking.paymentMethod || 'mock'})</div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {activeTab === 'favorites' && (
        favorites.length === 0 ? (
          <div className="glass-panel text-center" style={{ padding: '3rem' }}><h3>No favorites yet</h3><p className="text-muted" style={{ marginBottom: '2rem' }}>Save events from the events page.</p><Link to="/events" className="btn btn-primary">Browse Events</Link></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {favorites.map((event) => (
              <div key={event._id} className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
                <button onClick={() => removeFavorite(event._id)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#ef4444' }}>♥</button>
                <h3 style={{ marginBottom: '.5rem', paddingRight: '2rem' }}>{event.title}</h3>
                <div style={{ marginBottom: '1.5rem', fontSize: '.9rem' }}><div>📅 {new Date(event.date).toLocaleDateString()}</div><div>📍 {event.location}</div></div>
                <Link to={`/events/${event._id}`} className="btn btn-outline text-center">View Details</Link>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'orders' && (
        orders.length === 0 ? (
          <div className="glass-panel text-center" style={{ padding: '3rem' }}><h3>No merchandise orders yet</h3><p className="text-muted" style={{ marginBottom: '2rem' }}>Purchase merchandise to see order history.</p><Link to="/merchandise" className="btn btn-primary">Browse Merchandise</Link></div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {orders.map((order) => (
              <div key={order._id} className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
                  <div><span style={{ color: '#10b981', fontWeight: 700 }}>{(order.paymentStatus || 'paid').toUpperCase()}</span> • <span style={{ color: 'var(--accent-secondary)', fontWeight: 700 }}>{(order.shippingStatus || 'processing').toUpperCase()}</span></div>
                </div>
                <div className="text-muted" style={{ marginBottom: '1rem' }}>Date: {new Date(order.createdAt).toLocaleString()} | Total: ৳{order.totalAmount}</div>
                {order.items?.map((item, index) => <div key={index} style={{ padding: '.75rem 0', borderTop: '1px solid var(--border-subtle)' }}>{item.merchandise?.name || 'Merchandise'} × {item.quantity} — ৳{item.priceAtPurchase * item.quantity}</div>)}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default AttendeeDashboard;
