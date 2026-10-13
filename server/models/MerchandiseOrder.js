const mongoose = require("mongoose");

const merchandiseOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    merchandise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchandise",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Cancelled"],
      default: "Completed", // Mock payment default
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MerchandiseOrder", merchandiseOrderSchema);
