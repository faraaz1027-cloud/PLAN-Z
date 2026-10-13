import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import AttendeeDashboard from "./pages/AttendeeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Merchandise from "./pages/Merchandise";
import Cart from "./pages/Cart";
import Complaints from "./pages/Complaints";

// Placeholders for dashboards
const Dashboard = () => <div className="container" style={{marginTop: '2rem'}}><h1>Dashboard</h1></div>;

function App() {
  return (
    <div className="app-wrapper">
      <Navbar />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/merchandise" element={<Merchandise />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute allowedRoles={['attendee']}>
                <Cart />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['attendee']}>
                <AttendeeDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/organizer" 
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <OrganizerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<div className="container" style={{marginTop: '2rem'}}><h1>404 Not Found</h1></div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;