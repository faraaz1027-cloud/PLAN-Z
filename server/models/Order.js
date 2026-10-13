const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    merchandise: { type: mongoose.Schema.Types.ObjectId, ref: "Merchandise", required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceAtPurchase: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], default: [] },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "paid" },
    shippingStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
    status: { type: String, enum: ["Pending", "Completed", "Cancelled"], default: "Completed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
