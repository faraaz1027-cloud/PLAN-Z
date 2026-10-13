const Booking = require("../models/Booking");
const Event = require("../models/Event");
const Payment = require("../models/Payment");
const { normalizeEventTicketTypes, mapLegacyTicketName } = require("../utils/ticketTypes");

const ensureEventHasTickets = async (event) => {
  const normalizedTickets = normalizeEventTicketTypes(event.ticketTypes, event.price);
  const oldTickets = JSON.stringify((event.ticketTypes || []).map((t) => ({
    name: t.name,
    price: t.price,
    quantityAvailable: t.quantityAvailable,
    quantitySold: t.quantitySold,
  })));
  const newTickets = JSON.stringify(normalizedTickets);

  if (oldTickets !== newTickets) {
    event.ticketTypes = normalizedTickets;
    event.price = Math.min(...normalizedTickets.map((ticket) => ticket.price));
    try {
      await event.save();
    } catch (e) {
      console.warn("Could not save normalized event tickets:", e.message);
    }
  }

  return event;
};

const createBooking = async (req, res) => {
  try {
    if (req.user.role !== "attendee") {
      return res.status(403).json({ message: "Only attendees can book tickets" });
    }

    const { eventId, quantity, ticketType = "General Pass", paymentMethod = "mock" } = req.body;
    const requestedQuantity = Number(quantity);

    if (!eventId || !requestedQuantity) return res.status(400).json({ message: "Event ID and quantity are required" });
    if (requestedQuantity <= 0) return res.status(400).json({ message: "Quantity must be greater than 0" });

    let event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.status !== "approved") return res.status(400).json({ message: "Cannot book tickets for an unapproved event" });

    event = await ensureEventHasTickets(event);
    const normalizedRequestedTicket = mapLegacyTicketName(ticketType) || ticketType;
    let selectedTicket = event.ticketTypes.find((t) => t.name && t.name.toLowerCase() === normalizedRequestedTicket.toLowerCase()) || event.ticketTypes[0];
    if (!selectedTicket) return res.status(400).json({ message: "Invalid ticket type selected" });

    const available = selectedTicket.quantityAvailable - selectedTicket.quantitySold;
    if (available < requestedQuantity) return res.status(400).json({ message: `Only ${available} tickets available` });

    const totalPrice = selectedTicket.price * requestedQuantity;
    const booking = await Booking.create({
      user: req.user._id,
      event: eventId,
      ticketType: selectedTicket.name,
      quantity: requestedQuantity,
      totalPrice,
      paymentStatus: "pending",
      paymentMethod,
    });

    const populatedBooking = await Booking.findById(booking._id).populate("event", "title date location venue price ticketTypes");
    res.status(201).json(populatedBooking);
  } catch (err) {
    console.error("Create booking error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const payBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id || req.body.bookingId).populate("event");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized" });
    if (booking.paymentStatus === "paid") return res.status(400).json({ message: "Booking is already paid" });

    const event = await Event.findById(booking.event._id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    await ensureEventHasTickets(event);

    const normalizedBookingTicket = mapLegacyTicketName(booking.ticketType) || booking.ticketType || "General Pass";
    const selectedTicket = event.ticketTypes.find((t) => t.name && t.name.toLowerCase() === normalizedBookingTicket.toLowerCase()) || event.ticketTypes[0];
    const available = selectedTicket.quantityAvailable - selectedTicket.quantitySold;
    if (available < booking.quantity) return res.status(400).json({ message: "Tickets sold out before payment completion" });

    selectedTicket.quantitySold += booking.quantity;
    await event.save();

    const validMethods = ["bKash", "Nagad", "Cash", "Card", "Bank Transfer", "mock", "bkash"];
    const method = req.body.method && validMethods.includes(req.body.method) ? req.body.method : "mock";

    booking.paymentStatus = "paid";
    booking.paymentMethod = method;
    booking.paidAt = new Date();
    await booking.save();

    const payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: booking.totalPrice,
      method: method,
      status: "paid",
      transactionId: `${method.toUpperCase()}-${Date.now()}`,
      paidAt: booking.paidAt,
    });

    const populatedBooking = await Booking.findById(booking._id).populate("event", "title date location venue price");
    res.status(200).json({ message: "Payment successful", booking: populatedBooking, payment });
  } catch (err) {
    console.error("Pay booking error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate("event", "title date location venue price").sort("-createdAt");
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Get my bookings error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getEventAttendees = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view attendees for this event" });
    }

    const bookings = await Booking.find({ event: eventId }).populate("user", "name email").populate("event", "title").sort("-createdAt");
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Get event attendees error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createBooking, payBooking, getMyBookings, getEventAttendees };
