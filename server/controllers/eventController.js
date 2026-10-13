const mongoose = require("mongoose");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const Order = require("../models/Order");

const { normalizeEventTicketTypes, getMinimumTicketPrice } = require("../utils/ticketTypes");

const normalizeAndPersistEventTickets = async (event) => {
  if (!event) return event;
  const normalized = normalizeEventTicketTypes(event.ticketTypes, event.price);
  const oldTickets = JSON.stringify((event.ticketTypes || []).map((t) => ({
    name: t.name,
    price: t.price,
    quantityAvailable: t.quantityAvailable,
    quantitySold: t.quantitySold,
  })));
  const newTickets = JSON.stringify(normalized);

  if (oldTickets !== newTickets || event.price !== getMinimumTicketPrice(normalized)) {
    event.ticketTypes = normalized;
    event.price = getMinimumTicketPrice(normalized);
    await event.save();
  }
  return event;
};

const createEvent = async (req, res) => {
  try {
    const { title, venue, location, description, date, category, ticketTypes } = req.body;

    if (!title || !venue || !location || !description || !date || !category) {
      return res.status(400).json({ message: "Title, venue, location, description, date, and category are required" });
    }

    const normalizedTickets = normalizeEventTicketTypes(ticketTypes);
    const newEvent = await Event.create({
      title,
      venue,
      location,
      price: getMinimumTicketPrice(normalizedTickets),
      description,
      date,
      category,
      organizer: req.user._id,
      status: "pending",
      ticketTypes: normalizedTickets,
    });

    res.status(201).json(newEvent);
  } catch (err) {
    console.error("Create event error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getEvents = async (req, res) => {
  try {
    const { search, category, location, date } = req.query;
    const query = { status: "approved" };

    if (search?.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ title: regex }, { description: regex }, { venue: regex }, { location: regex }];
    }
    if (category?.trim()) query.category = { $regex: category.trim(), $options: "i" };
    if (location?.trim()) query.location = { $regex: location.trim(), $options: "i" };
    if (date) {
      const searchDate = new Date(date);
      if (!Number.isNaN(searchDate.getTime())) {
        const nextDay = new Date(searchDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query.date = { $gte: searchDate, $lt: nextDay };
      }
    }

    const events = await Event.find(query).populate("organizer", "name email").sort({ date: 1 });
    const normalizedEvents = await Promise.all(events.map(normalizeAndPersistEventTickets));
    res.status(200).json(normalizedEvents);
  } catch (err) {
    console.error("Get events error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getEventById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid event ID" });
    const event = await Event.findById(req.params.id).populate("organizer", "name email");
    if (!event) return res.status(404).json({ message: "Event not found" });
    await normalizeAndPersistEventTickets(event);
    res.status(200).json(event);
  } catch (err) {
    console.error("Get event error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getOrganizerEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort("-createdAt");
    const normalizedEvents = await Promise.all(events.map(normalizeAndPersistEventTickets));
    res.status(200).json(normalizedEvents);
  } catch (err) {
    console.error("Get organizer events error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this event" });
    }

    const allowedFields = ["title", "venue", "location", "description", "date", "category"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) event[field] = req.body[field];
    });
    if (req.body.ticketTypes !== undefined) {
      event.ticketTypes = normalizeEventTicketTypes(req.body.ticketTypes, event.price);
      event.price = getMinimumTicketPrice(event.ticketTypes);
    }
    await event.save();
    res.status(200).json(event);
  } catch (err) {
    console.error("Update event error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const cancelEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this event" });
    }
    event.status = "cancelled";
    await event.save();
    res.status(200).json({ message: "Event cancelled", event });
  } catch (err) {
    console.error("Cancel event error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to remove this event" });
    }
    event.status = req.user.role === "admin" ? "removed" : "cancelled";
    await event.save();
    res.status(200).json({ message: req.user.role === "admin" ? "Event removed" : "Event cancelled", event });
  } catch (err) {
    console.error("Delete/cancel event error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find().populate("organizer", "name email").sort("-createdAt");
    const normalizedEvents = await Promise.all(events.map(normalizeAndPersistEventTickets));
    res.status(200).json(normalizedEvents);
  } catch (err) {
    console.error("Admin get all events error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateEventStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending", "cancelled", "removed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    event.status = status;
    await event.save();
    res.status(200).json(event);
  } catch (err) {
    console.error("Update event status error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const removeApprovedEvent = async (req, res) => updateEventStatus({ ...req, body: { status: "removed" } }, res);

const getEventSales = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId || req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (req.user.role !== "admin" && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view sales for this event" });
    }

    const bookings = await Booking.find({ event: event._id, paymentStatus: "paid" });
    const ticketSales = {};
    let totalTicketsSold = 0;
    let totalRevenue = 0;

    bookings.forEach((booking) => {
      totalTicketsSold += booking.quantity;
      totalRevenue += booking.totalPrice;
      if (!ticketSales[booking.ticketType]) ticketSales[booking.ticketType] = { ticketType: booking.ticketType, quantity: 0, revenue: 0 };
      ticketSales[booking.ticketType].quantity += booking.quantity;
      ticketSales[booking.ticketType].revenue += booking.totalPrice;
    });

    res.status(200).json({
      eventId: event._id,
      eventTitle: event.title,
      totalTicketsSold,
      totalRevenue,
      ticketSales: Object.values(ticketSales),
    });
  } catch (err) {
    console.error("Get event sales error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAdminSales = async (req, res) => {
  try {
    const paidBookings = await Booking.find({ paymentStatus: "paid" }).populate("event", "title");
    const totalBookings = await Booking.countDocuments();
    const orders = await Order.find({ paymentStatus: "paid" });
    const byEvent = {};
    let totalRevenue = 0;

    paidBookings.forEach((booking) => {
      totalRevenue += booking.totalPrice;
      const key = booking.event?._id?.toString() || "unknown";
      if (!byEvent[key]) byEvent[key] = { eventTitle: booking.event?.title || "Deleted Event", ticketsSold: 0, revenue: 0 };
      byEvent[key].ticketsSold += booking.quantity;
      byEvent[key].revenue += booking.totalPrice;
    });

    const merchandiseRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    res.status(200).json({
      totalBookings,
      totalPaidBookings: paidBookings.length,
      ticketRevenue: totalRevenue,
      merchandiseRevenue,
      totalRevenue: totalRevenue + merchandiseRevenue,
      ticketsSoldPerEvent: Object.values(byEvent),
    });
  } catch (err) {
    console.error("Admin sales error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAdminActivity = async (req, res) => {
  try {
    const [totalUsers, totalEvents, pendingEvents, approvedEvents, cancelledEvents, removedEvents, totalBookings, totalOrders, totalComplaints] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Event.countDocuments({ status: "pending" }),
      Event.countDocuments({ status: "approved" }),
      Event.countDocuments({ status: "cancelled" }),
      Event.countDocuments({ status: "removed" }),
      Booking.countDocuments(),
      Order.countDocuments(),
      Complaint.countDocuments(),
    ]);
    res.status(200).json({ totalUsers, totalEvents, pendingEvents, approvedEvents, cancelledEvents, removedEvents, totalBookings, totalOrders, totalComplaints });
  } catch (err) {
    console.error("Admin activity error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  getOrganizerEvents,
  updateEvent,
  cancelEvent,
  deleteEvent,
  getAllEventsAdmin,
  updateEventStatus,
  removeApprovedEvent,
  getEventSales,
  getAdminSales,
  getAdminActivity,
};
