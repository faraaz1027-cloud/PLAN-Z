const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Merchandise = require("../models/Merchandise");

const createOrder = async (req, res) => {
  try {
    if (req.user.role !== "attendee") return res.status(403).json({ message: "Only attendees can create orders" });
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.merchandise");
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: "Cart is empty" });

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (!item.merchandise) return res.status(400).json({ message: "Invalid item in cart" });
      const merch = await Merchandise.findById(item.merchandise._id);
      if (!merch) return res.status(404).json({ message: "Merchandise not found" });
      if (merch.stock < item.quantity) return res.status(400).json({ message: `Not enough stock for ${merch.name}` });
      orderItems.push({ merchandise: merch._id, quantity: item.quantity, priceAtPurchase: merch.price });
      totalAmount += merch.price * item.quantity;
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      paymentStatus: "paid",
      shippingStatus: "processing",
      status: "Completed",
    });

    for (const item of orderItems) {
      await Merchandise.findByIdAndUpdate(item.merchandise, { $inc: { stock: -item.quantity } });
    }

    cart.items = [];
    await cart.save();
    const populated = await Order.findById(order._id).populate("items.merchandise");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("items.merchandise").sort("-createdAt");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.merchandise");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") return res.status(403).json({ message: "Not authorized" });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById };
