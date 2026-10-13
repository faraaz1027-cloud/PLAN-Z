import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await API.get('/cart');
      setCart(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load cart.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await API.put(`/cart/${itemId}`, { quantity: newQuantity });
      fetchCart();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await API.delete(`/cart/${itemId}`);
      fetchCart();
    } catch (err) {
      alert('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    try {
      await API.delete('/cart');
      fetchCart();
    } catch (err) {
      alert('Failed to clear cart');
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      await API.post('/orders');
      alert('Checkout successful! Mock payment processed.');
      navigate('/dashboard'); // Navigate to attendee dashboard to see orders
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) return <div className="container text-center" style={{ marginTop: '5rem' }}><h2>Loading Cart...</h2></div>;

  if (user?.role !== 'attendee') {
    return <div className="container text-center" style={{ marginTop: '5rem' }}><h2>Only attendees can use the cart.</h2></div>;
  }

  const totalAmount = cart?.items?.reduce((total, item) => total + (item.merchandise?.price * item.quantity), 0) || 0;

  return (
    <div className="container animate-fade-in">
      <h2 style={{ marginBottom: '2rem' }}>Shopping <span className="text-gradient">Cart</span></h2>

      {error && <div className="error-msg">{error}</div>}

      {!cart || cart.items.length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '3rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Your cart is empty</h3>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>Looks like you haven't added any merchandise yet.</p>
          <Link to="/merchandise" className="btn btn-primary">Browse Merchandise</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          {/* Cart Items */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3>Items ({cart.items.length})</h3>
              <button onClick={handleClearCart} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Clear Cart</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.items.map((item) => (
                item.merchandise && (
                  <div key={item._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>{item.merchandise.name}</h4>
                      <div style={{ color: 'var(--accent-secondary)', fontWeight: '600' }}>৳{item.merchandise.price} each</div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.3rem', borderRadius: '8px' }}>
                        <button onClick={() => handleUpdateQuantity(item.merchandise._id, item.quantity - 1)} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', padding: '0 0.5rem', fontSize: '1.2rem' }}>-</button>
                        <span style={{ fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => handleUpdateQuantity(item.merchandise._id, item.quantity + 1)} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', padding: '0 0.5rem', fontSize: '1.2rem' }}>+</button>
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '1.1rem', minWidth: '80px', textAlign: 'right' }}>
                        ৳{item.merchandise.price * item.quantity}
                      </div>
                      <button onClick={() => handleRemoveItem(item.merchandise._id)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Checkout Summary */}
          <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content', position: 'sticky', top: '100px' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
              <span>Subtotal</span>
              <span>৳{totalAmount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
              <span>Processing Fee</span>
              <span>৳0 (Mock)</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.4rem', fontWeight: '700', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <span>Total</span>
              <span className="text-gradient">৳{totalAmount}</span>
            </div>

            <button 
              onClick={handleCheckout} 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              disabled={checkoutLoading || cart.items.length === 0}
            >
              {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
