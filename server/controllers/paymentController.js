const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const { payBooking } = require("./bookingController");

const mockPayment = async (req, res, next) => {
  req.params.id = req.body.bookingId || req.params.id;
  return payBooking(req, res, next);
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("booking");
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this payment" });
    }
    res.status(200).json(payment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { mockPayment, getPaymentById };
