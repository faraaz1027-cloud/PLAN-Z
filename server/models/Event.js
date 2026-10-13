const mongoose = require("mongoose");
const { normalizeEventTicketTypes, getMinimumTicketPrice } = require("../utils/ticketTypes");

const ticketTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      enum: ["General Pass", "VIP", "Early Access"],
    },
    price: { type: Number, required: true, min: 0, default: 100 },
    quantityAvailable: { type: Number, required: true, min: 0, default: 100 },
    quantitySold: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    price: { type: Number, min: 0, default: 100 },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    category: { type: String, required: true, trim: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "removed"],
      default: "pending",
    },
    ticketTypes: { type: [ticketTypeSchema], default: [] },
  },
  { timestamps: true }
);

eventSchema.pre("validate", function (next) {
  this.ticketTypes = normalizeEventTicketTypes(this.ticketTypes, this.price);
  this.price = getMinimumTicketPrice(this.ticketTypes);
  next();
});

module.exports = mongoose.model("Event", eventSchema);
