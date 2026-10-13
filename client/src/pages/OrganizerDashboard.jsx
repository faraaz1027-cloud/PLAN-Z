import { useState, useEffect } from 'react';
import API from '../services/api';

const TICKET_CATEGORIES = [
  { name: 'General Pass', defaultPrice: 100, defaultQuantity: 100 },
  { name: 'VIP', defaultPrice: 500, defaultQuantity: 30 },
  { name: 'Early Access', defaultPrice: 250, defaultQuantity: 50 },
];

const buildDefaultTickets = () => TICKET_CATEGORIES.map((ticket) => ({
  name: ticket.name,
  price: ticket.defaultPrice,
  quantityAvailable: ticket.defaultQuantity,
  quantitySold: 0,
}));

const normalizeTicketName = (name = '') => {
  const value = String(name).trim().toLowerCase();
  if (['regular', 'general', 'general admission', 'general pass', 'standard'].includes(value)) return 'General Pass';
  if (value === 'vip') return 'VIP';
  if (['early', 'early access', 'early bird'].includes(value)) return 'Early Access';
  return name;
};

const normalizeTickets = (ticketTypes = []) => {
  const existing = {};
  if (Array.isArray(ticketTypes)) {
    ticketTypes.forEach((ticket) => {
      const name = normalizeTicketName(ticket.name || ticket.type || ticket.ticketType || '');
      if (TICKET_CATEGORIES.some((category) => category.name === name) && !existing[name]) {
        existing[name] = ticket;
      }
    });
  }

  return TICKET_CATEGORIES.map((category) => {
    const ticket = existing[category.name] || {};
    return {
      name: category.name,
      price: Number(ticket.price ?? ticket.ticketPrice ?? category.defaultPrice) || category.defaultPrice,
      quantityAvailable: Number(ticket.quantityAvailable ?? ticket.quantity ?? ticket.available ?? category.defaultQuantity) || category.defaultQuantity,
      quantitySold: Number(ticket.quantitySold ?? ticket.sold ?? 0) || 0,
    };
  });
};

const emptyEvent = {
  title: '',
  venue: '',
  location: '',
  description: '',
  date: '',
  category: '',
  ticketTypes: buildDefaultTickets(),
};

const emptyMerch = { name: '', description: '', productType: 'General', price: 500, stock: 50 };

const OrganizerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [formData, setFormData] = useState(emptyEvent);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [sales, setSales] = useState(null);
  const [merchandise, setMerchandise] = useState([]);
  const [merchForm, setMerchForm] = useState(emptyMerch);
  const [editingMerchId, setEditingMerchId] = useState(null);

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const res = await API.get('/events/organizer/my-events');
      setEvents(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyEvents(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleTicketChange = (index, field, value) => {
    const updated = [...formData.ticketTypes];
    updated[index] = {
      ...updated[index],
      [field]: Number(value) < 0 ? 0 : Number(value),
    };
    setFormData({ ...formData, ticketTypes: updated });
  };

  const resetEventForm = () => {
    setFormData({ ...emptyEvent, ticketTypes: buildDefaultTickets() });
    setEditingEventId(null);
    setShowForm(false);
  };

  const getEventPayload = () => ({
    title: formData.title,
    venue: formData.venue,
    location: formData.location,
    description: formData.description,
    date: formData.date,
    category: formData.category,
    ticketTypes: normalizeTickets(formData.ticketTypes),
  });

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    try {
      const payload = getEventPayload();
      if (editingEventId) await API.put(`/events/${editingEventId}`, payload);
      else await API.post('/events', payload);
      resetEventForm();
      fetchMyEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save event');
    }
  };

  const startEditEvent = (event) => {
    setFormData({
      title: event.title || '',
      venue: event.venue || '',
      location: event.location || '',
      description: event.description || '',
      date: event.date ? new Date(event.date).toISOString().slice(0, 10) : '',
      category: event.category || '',
      ticketTypes: normalizeTickets(event.ticketTypes),
    });
    setEditingEventId(event._id);
    setShowForm(true);
  };

  const cancelEvent = async (eventId) => {
    if (!window.confirm('Cancel this event?')) return;
    try {
      await API.put(`/events/${eventId}/cancel`);
      fetchMyEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel event');
    }
  };

  const openManagement = async (event) => {
    setSelectedEvent(event);
    setAttendees([]);
    setSales(null);
    setMerchandise([]);
    try {
      const [attRes, salesRes, merchRes] = await Promise.all([
        API.get(`/bookings/event/${event._id}`).catch(() => ({ data: [] })),
        API.get(`/events/${event._id}/sales`).catch(() => ({ data: null })),
        API.get(`/merchandise/event/${event._id}`).catch(() => ({ data: [] })),
      ]);
      setAttendees(attRes.data);
      setSales(salesRes.data);
      setMerchandise(merchRes.data);
    } catch (err) {
      alert('Failed to load event management data');
    }
  };

  const handleMerchChange = (e) => setMerchForm({ ...merchForm, [e.target.name]: e.target.value });
  const resetMerchForm = () => { setMerchForm(emptyMerch); setEditingMerchId(null); };

  const saveMerchandise = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;
    try {
      if (editingMerchId) await API.put(`/merchandise/${editingMerchId}`, merchForm);
      else await API.post('/merchandise', { ...merchForm, eventId: selectedEvent._id });
      resetMerchForm();
      openManagement(selectedEvent);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save merchandise');
    }
  };

  const editMerchandise = (item) => {
    setEditingMerchId(item._id);
    setMerchForm({
      name: item.name,
      description: item.description,
      productType: item.productType || 'General',
      price: item.price,
      stock: item.stock,
    });
  };

  const deleteMerchandise = async (itemId) => {
    if (!window.confirm('Delete this merchandise?')) return;
    try {
      await API.delete(`/merchandise/${itemId}`);
      openManagement(selectedEvent);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete merchandise');
    }
  };

  const formatEventDate = (date) => {
    const parsed = new Date(date);
    return date && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleDateString() : 'Date TBA';
  };

  const formatEventLocation = (event) => [event.venue, event.location].filter(Boolean).join(', ') || 'Location TBA';

  if (loading) return <div className="container text-center" style={{ marginTop: '5rem' }}><h2>Loading Dashboard...</h2></div>;

  return (
    <div className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Organizer <span className="text-gradient">Dashboard</span></h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingEventId(null); setFormData({ ...emptyEvent, ticketTypes: buildDefaultTickets() }); }}>{showForm ? 'Close Form' : '+ Create New Event'}</button>
      </div>
      {error && <div className="error-msg">{error}</div>}

      {showForm && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3>{editingEventId ? 'Edit Event' : 'Create Event'}</h3>
          <form onSubmit={handleSubmitEvent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            {['title','category','venue','location'].map((field) => (
              <div className="form-group" key={field}>
                <label className="form-label">{field[0].toUpperCase()+field.slice(1)}</label>
                <input type="text" name={field} className="form-input" value={formData[field]} onChange={handleChange} required />
              </div>
            ))}
            <div className="form-group"><label className="form-label">Date</label><input type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} required /></div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}><label className="form-label">Description</label><textarea name="description" className="form-input" rows="3" value={formData.description} onChange={handleChange} required /></div>

            <div className="glass-panel" style={{ gridColumn: 'span 2', padding: '1rem', background: 'rgba(0,0,0,.2)' }}>
              <h4 style={{ marginBottom: '.5rem' }}>Ticket Categories</h4>
              <p className="text-muted" style={{ marginBottom: '1rem' }}>Set the price and available quantity for each required ticket type.</p>
              {formData.ticketTypes.map((ticket, i) => (
                <div key={ticket.name} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem', alignItems: 'end' }}>
                  <div>
                    <label className="form-label">Ticket Category</label>
                    <input className="form-input" value={ticket.name} readOnly />
                  </div>
                  <div>
                    <label className="form-label">{ticket.name} Price (৳)</label>
                    <input className="form-input" type="number" min="0" value={ticket.price} onChange={e => handleTicketChange(i,'price',e.target.value)} required />
                  </div>
                  <div>
                    <label className="form-label">{ticket.name} Quantity</label>
                    <input className="form-input" type="number" min="0" value={ticket.quantityAvailable} onChange={e => handleTicketChange(i,'quantityAvailable',e.target.value)} required />
                  </div>
                </div>
              ))}
            </div>
            <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }}>{editingEventId ? 'Save Changes' : 'Submit Event'}</button>
          </form>
        </div>
      )}

      <h3>Your Events</h3>
      {events.length === 0 ? <p className="text-muted" style={{ marginTop: '1rem' }}>You have not created events yet.</p> : <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        {events.map((event) => <div key={event._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div><h4 style={{ fontSize: '1.2rem', marginBottom: '.5rem' }}>{event.title}</h4><div style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>📅 {formatEventDate(event.date)} | 📍 {formatEventLocation(event)}</div></div>
          <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ padding: '.3rem .8rem', borderRadius: '20px', fontSize: '.8rem', background: event.status === 'approved' ? 'rgba(16,185,129,.2)' : event.status === 'rejected' || event.status === 'removed' ? 'rgba(239,68,68,.2)' : 'rgba(245,158,11,.2)', color: event.status === 'approved' ? '#10b981' : event.status === 'rejected' || event.status === 'removed' ? '#ef4444' : '#f59e0b' }}>{event.status?.toUpperCase()}</span>
            <button className="btn btn-outline" onClick={() => startEditEvent(event)} style={{ padding: '.4rem .9rem' }}>Edit</button>
            <button className="btn btn-outline" onClick={() => cancelEvent(event._id)} style={{ padding: '.4rem .9rem' }}>Cancel</button>
            <button className="btn btn-primary" onClick={() => openManagement(event)} style={{ padding: '.4rem .9rem' }}>Manage</button>
          </div>
        </div>)}
      </div>}

      {selectedEvent && <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Manage: {selectedEvent.title}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div><h4>Ticket Sales</h4>{sales ? <div className="text-muted"><p>Total Tickets Sold: {sales.totalTicketsSold}</p><p>Total Revenue: ৳{sales.totalRevenue}</p>{sales.ticketSales?.map(t => <p key={t.ticketType}>{t.ticketType}: {t.quantity} sold, ৳{t.revenue}</p>)}</div> : <p className="text-muted">No sales yet.</p>}</div>
          <div><h4>Attendees</h4>{attendees.length === 0 ? <p className="text-muted">No attendees yet.</p> : attendees.map(b => <div key={b._id} style={{ borderTop: '1px solid var(--border-subtle)', padding: '.5rem 0' }}>{b.user?.name} ({b.user?.email}) — {b.ticketType} × {b.quantity} — {b.paymentStatus}</div>)}</div>
        </div>
        <div style={{ marginTop: '2rem' }}>
          <h4>Merchandise</h4>
          <form onSubmit={saveMerchandise} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0' }}>
            <input className="form-input" name="name" placeholder="Name" value={merchForm.name} onChange={handleMerchChange} required />
            <input className="form-input" name="productType" placeholder="Product Type" value={merchForm.productType} onChange={handleMerchChange} />
            <input className="form-input" name="price" type="number" placeholder="Price" value={merchForm.price} onChange={handleMerchChange} min="1" required />
            <input className="form-input" name="stock" type="number" placeholder="Stock" value={merchForm.stock} onChange={handleMerchChange} min="0" required />
            <input className="form-input" name="description" placeholder="Description" value={merchForm.description} onChange={handleMerchChange} required />
            <button className="btn btn-primary" type="submit">{editingMerchId ? 'Update Merchandise' : 'Add Merchandise'}</button>
            {editingMerchId && <button className="btn btn-outline" type="button" onClick={resetMerchForm}>Cancel Edit</button>}
          </form>
          {merchandise.length === 0 ? <p className="text-muted">No merchandise for this event yet.</p> : merchandise.map(item => <div key={item._id} style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}><span>{item.name} — ৳{item.price} — Stock: {item.stock}</span><span><button className="btn btn-outline" onClick={() => editMerchandise(item)} style={{ padding: '.3rem .8rem', marginRight: '.5rem' }}>Edit</button><button className="btn btn-outline" onClick={() => deleteMerchandise(item._id)} style={{ padding: '.3rem .8rem' }}>Delete</button></span></div>)}
        </div>
      </div>}
    </div>
  );
};

export default OrganizerDashboard;
