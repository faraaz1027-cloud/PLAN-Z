import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { normalizeTickets } from '../utils/tickets';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking state
  const [quantity, setQuantity] = useState(1);
  const [ticketType, setTicketType] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');
  
  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bKash');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await API.get(`/events/${id}`);
        const normalized = { ...res.data, ticketTypes: normalizeTickets(res.data.ticketTypes, res.data.price) };
        setEvent(normalized);
        setTicketType(normalized.ticketTypes[0].name);
        setLoading(false);
      } catch (err) {
        setError('Event not found or failed to load.');
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Calculate current ticket price
  const getTicketPrice = () => {
    if (!event) return 0;
    const tickets = normalizeTickets(event.ticketTypes, event.price);
    const selected = tickets.find(t => t.name === ticketType) || tickets[0];
    return selected.price;
  };

  const getAvailableQuantity = () => {
    if (!event) return 10; // fallback max
    const tickets = normalizeTickets(event.ticketTypes, event.price);
    const selected = tickets.find(t => t.name === ticketType) || tickets[0];
    return Math.max(0, Number(selected.quantityAvailable) - Number(selected.quantitySold));
  };

  const handleBookTicket = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');
    
    if (!user) {
      navigate('/login');
      return;
    }

    const available = getAvailableQuantity();
    if (quantity > available) {
      setBookingError(`Only ${available} tickets left for this type.`);
      return;
    }

    setBookingLoading(true);

    try {
      const res = await API.post('/bookings', {
        eventId: id,
        quantity,
        ticketType
      });
      
      setPendingBookingId(res.data._id);
      setShowPaymentModal(true);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to initialize booking. Server error.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!pendingBookingId) return;
    setPaymentLoading(true);
    try {
      await API.post('/payments/mock', { bookingId: pendingBookingId, method: paymentMethod });
      setShowPaymentModal(false);
      setBookingSuccess('Payment successful! Ticket booked. You can view it in your dashboard.');
      setQuantity(1);
      const refreshed = await API.get(`/events/${id}`);
      setEvent({ ...refreshed.data, ticketTypes: normalizeTickets(refreshed.data.ticketTypes, refreshed.data.price) });
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Payment failed.');
      setShowPaymentModal(false);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) return <div className="container text-center" style={{ marginTop: '5rem' }}><h2>Loading event details...</h2></div>;
  if (error) return <div className="container text-center" style={{ marginTop: '5rem' }}><div className="error-msg">{error}</div></div>;
  if (!event) return null;

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '900px' }}>
      <Link to="/events" className="text-muted" style={{ display: 'inline-block', marginBottom: '2rem' }}>
        &larr; Back to Events
      </Link>

      <div className="glass-panel" style={{ padding: '3rem', position: 'relative' }}>
        <span style={{ 
            background: 'rgba(99, 102, 241, 0.2)', 
            color: 'var(--accent-primary)',
            padding: '0.4rem 1rem',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            position: 'absolute',
            top: '3rem',
            right: '3rem'
        }}>
            {event.category || 'General'}
        </span>

        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', paddingRight: '100px' }}>{event.title}</h1>
        
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', color: 'var(--text-muted)' }}>
          <div>📅 {event.date && !isNaN(new Date(event.date).getTime()) ? new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date TBA'}</div>
          <div>📍 {[event.venue, event.location].filter(Boolean).join(', ') || 'Location TBA'}</div>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'white' }}>About this event</h3>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{event.description}</p>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Book Tickets</span>
          </h3>

          {bookingSuccess && <div style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{bookingSuccess}</div>}
          {bookingError && <div className="error-msg">{bookingError}</div>}

          {!user ? (
            <div className="text-center" style={{ padding: '2rem 0' }}>
              <p style={{ marginBottom: '1rem' }}>You need to be logged in to book tickets.</p>
              <Link to="/login" className="btn btn-primary">Log in to Book</Link>
            </div>
          ) : user.role !== 'attendee' ? (
            <div className="text-center" style={{ padding: '2rem 0' }}>
              <p className="text-muted">Only attendees can book tickets.</p>
            </div>
          ) : (
            <form onSubmit={handleBookTicket} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label className="form-label">Ticket Type</label>
                <select className="form-select" value={ticketType} onChange={(e) => setTicketType(e.target.value)}>
                  {normalizeTickets(event.ticketTypes, event.price).map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name} (৳{t.price}) - {Math.max(0, t.quantityAvailable - t.quantitySold)} left
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{ width: '120px' }}>
                <label className="form-label">Quantity</label>
                <input 
                  type="number" 
                  className="form-input" 
                  min="1" 
                  max={getAvailableQuantity() > 0 ? getAvailableQuantity() : 1}
                  value={quantity} 
                  onChange={(e) => setQuantity(Number(e.target.value))} 
                />
              </div>

              <div style={{ paddingBottom: '0.5rem', fontWeight: '600', fontSize: '1.2rem', minWidth: '100px' }}>
                Total: ৳{getTicketPrice() * quantity}
              </div>

              <button type="submit" className="btn btn-primary" disabled={bookingLoading || getAvailableQuantity() === 0} style={{ flex: '1 1 200px' }}>
                {getAvailableQuantity() === 0 ? 'Sold Out' : bookingLoading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Mock Payment Modal */}
      {showPaymentModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ padding: '3rem', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Secure Payment</h2>
            <div style={{ marginBottom: '2rem', fontSize: '1.2rem' }}>
              Total Amount to Pay: <strong style={{ color: 'var(--accent-secondary)' }}>৳{getTicketPrice() * quantity}</strong>
            </div>
            
            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <label className="form-label">Select Payment Method</label>
              <select 
                className="form-select" 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <p className="text-muted" style={{ marginBottom: '2rem' }}>
              This is a mock payment gateway for the PLAN-Z demo. Click confirm to simulate a successful transaction.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setShowPaymentModal(false)} disabled={paymentLoading}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handlePayment} disabled={paymentLoading}>
                {paymentLoading ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
