const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    ticketType: { type: String, default: "General Pass" },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "Pending", "Completed", "Failed", "Refunded"],
      default: "pending",
    },
    paymentMethod: { 
      type: String, 
      enum: ["mock", "bkash", "Mock", "bKash", "Nagad", "Cash", "Card", "Bank Transfer"], 
      default: "mock" 
    },
    ticketCode: { type: String, unique: true, sparse: true },
    paidAt: Date,
  },
  { timestamps: true }
);

bookingSchema.pre("save", function (next) {
  if (!this.ticketCode) {
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    this.ticketCode = `PLANZ-${Date.now().toString(36).toUpperCase()}-${suffix}`;
  }
  if (this.paymentStatus === "Pending") this.paymentStatus = "pending";
  if (this.paymentStatus === "Completed") this.paymentStatus = "paid";
  if (this.paymentStatus === "Failed") this.paymentStatus = "failed";
  if (this.paymentStatus === "Refunded") this.paymentStatus = "refunded";
  if (this.paymentMethod === "Mock") this.paymentMethod = "mock";
  if (this.paymentMethod === "bKash") this.paymentMethod = "bkash";
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
