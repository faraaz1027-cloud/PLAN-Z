import { useEffect, useState } from "react";

function UserDashboard() {
  const [events, setEvents] = useState([]);
  const [showRequestForm, setShowRequestForm] = useState(false);

  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const EVENTS_URL = "http://127.0.0.1:5000/api/events";

  const fetchEvents = async () => {
    const res = await fetch(EVENTS_URL);
    const data = await res.json();
    setEvents(data);
  };

  const submitEventRequest = async () => {
    if (!title || !venue || !location || !price || !description) {
      alert("Please fill all fields");
      return;
    }

    await fetch(EVENTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, venue, location, price, description }),
    });

    alert("Event request sent to admin for approval");

    setTitle("");
    setVenue("");
    setLocation("");
    setPrice("");
    setDescription("");
    setShowRequestForm(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>User Dashboard</h1>

      <h2>Available Events</h2>

      {events.map((event) => (
        <div key={event._id} style={{ marginBottom: "20px" }}>
          <h3>{event.title}</h3>
          <p>Venue: {event.venue || event.location}</p>
          <p>Location: {event.location}</p>
          <p>Price: {event.price ? `৳${event.price}` : "TBA"}</p>
          <p>{event.description}</p>
        </div>
      ))}

      <hr />

      <h2>Want to organize an event?</h2>
      <p>Submit your event details here. Admin will review and approve it.</p>

      <button onClick={() => setShowRequestForm(!showRequestForm)}>
        Contact Admin / Submit Event Request
      </button>

      {showRequestForm && (
        <div style={{ marginTop: "20px" }}>
          <input
            type="text"
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="text"
            placeholder="Venue"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
          />

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            type="number"
            placeholder="Ticket price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <textarea
            placeholder="Event description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button onClick={submitEventRequest}>Send Request</button>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;