const mongoose = require("mongoose");

const merchandiseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    productType: { type: String, default: "General", trim: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Merchandise", merchandiseSchema);
