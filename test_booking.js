async function test() {
  const baseUrl = 'http://localhost:5000/api';

  async function apiPost(path, body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(baseUrl + path, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`POST ${path} returned non-JSON: ${text.substring(0, 100)}...`);
    }
    if (!res.ok) throw new Error(`POST ${path} failed: ` + JSON.stringify(data));
    return { data };
  }

  async function apiPut(path, body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(baseUrl + path, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`PUT ${path} returned non-JSON: ${text.substring(0, 100)}...`);
    }
    if (!res.ok) throw new Error(`PUT ${path} failed: ` + JSON.stringify(data));
    return { data };
  }

  try {
    // 1. Register admin
    const adminRes = await apiPost('/auth/register', {
      name: 'Test Admin 4',
      email: `admin${Date.now()}@test.com`,
      password: 'password123',
      role: 'admin'
    });
    const adminToken = adminRes.data.token;
    console.log('Admin registered');

    // 2. Register organizer
    const orgRes = await apiPost('/auth/register', {
      name: 'Test Organizer 4',
      email: `org${Date.now()}@test.com`,
      password: 'password123',
      role: 'organizer'
    });
    const orgToken = orgRes.data.token;

    // 3. Create event
    const eventRes = await apiPost('/events', {
      title: 'Test Event 4',
      venue: 'Test Venue',
      location: 'Test Location',
      price: 100,
      description: 'Test Description',
      date: new Date(Date.now() + 86400000).toISOString(),
      category: 'Workshop',
      ticketTypes: [{ name: 'Regular', price: 100, quantityAvailable: 100 }]
    }, orgToken);
    const eventId = eventRes.data._id;
    console.log('Event created:', eventId);

    // 4. Approve event
    await apiPut(`/events/admin/${eventId}/status`, { status: 'approved' }, adminToken);
    console.log('Event approved');

    // 5. Book ticket
    const attendeeRes = await apiPost('/auth/register', {
      name: 'Test Attendee 4',
      email: `attendee${Date.now()}@test.com`,
      password: 'password123',
      role: 'attendee'
    });
    const attendeeToken = attendeeRes.data.token;

    console.log('Booking ticket...');
    const bookRes = await apiPost('/bookings', {
      eventId: eventId,
      quantity: 1,
      ticketType: 'Regular'
    }, attendeeToken);
    const bookingId = bookRes.data._id;
    console.log('Ticket booked:', bookingId);

    // 6. Pay ticket
    console.log('Paying ticket...');
    const payRes = await apiPost('/payments/mock', {
      bookingId: bookingId,
      method: 'bKash'
    }, attendeeToken);
    console.log('Ticket paid:', payRes.data);

  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
