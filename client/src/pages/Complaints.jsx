import { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ subject: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useContext(AuthContext);

  const fetchComplaints = async () => {
    try {
      const res = await API.get('/complaints/my-complaints');
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.post('/complaints', formData);
      alert('Complaint submitted successfully!');
      setFormData({ subject: '', description: '' });
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div className="container text-center" style={{ marginTop: '5rem' }}><h2>Please <Link to="/login" className="text-gradient">log in</Link> to file a complaint.</h2></div>;
  }

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '2rem' }}>Support & <span className="text-gradient">Complaints</span></h2>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Submit a New Complaint</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input type="text" name="subject" className="form-input" value={formData.subject} onChange={handleChange} required placeholder="What is the issue about?" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-input" value={formData.description} onChange={handleChange} required rows="4" placeholder="Provide details..."></textarea>
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>

      <h3 style={{ marginBottom: '1.5rem' }}>My Complaint History</h3>
      {loading ? (
        <p>Loading...</p>
      ) : complaints.length === 0 ? (
        <p className="text-muted">You have not submitted any complaints.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {complaints.map(c => (
            <div key={c._id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.2rem' }}>{c.subject}</h4>
                <span style={{ color: c.status === 'Resolved' ? '#10b981' : '#f59e0b', fontWeight: '600' }}>{c.status}</span>
              </div>
              <p className="text-muted" style={{ marginBottom: '1rem' }}>{c.description}</p>
              {c.response && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '8px' }}>
                  <strong style={{ color: '#10b981' }}>Admin Response:</strong> <br />
                  {c.response}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Complaints;
