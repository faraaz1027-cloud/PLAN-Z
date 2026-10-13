const Cart = require("../models/Cart");
const Merchandise = require("../models/Merchandise");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate("items.merchandise");
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

const ensureAttendee = (req, res) => {
  if (req.user.role !== "attendee") {
    res.status(403).json({ message: "Only attendees can use the cart" });
    return false;
  }
  return true;
};

const getCart = async (req, res) => {
  try {
    if (!ensureAttendee(req, res)) return;
    const cart = await getOrCreateCart(req.user._id);
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const addToCart = async (req, res) => {
  try {
    if (!ensureAttendee(req, res)) return;
    const { merchandiseId, quantity } = req.body;
    const requestedQuantity = Number(quantity);
    if (!merchandiseId || !requestedQuantity) return res.status(400).json({ message: "Merchandise ID and quantity required" });
    if (requestedQuantity <= 0) return res.status(400).json({ message: "Quantity must be greater than 0" });

    const merchandise = await Merchandise.findById(merchandiseId);
    if (!merchandise) return res.status(404).json({ message: "Merchandise not found" });
    if (merchandise.stock < requestedQuantity) return res.status(400).json({ message: "Not enough stock available" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const itemIndex = cart.items.findIndex((item) => item.merchandise.toString() === merchandiseId);
    if (itemIndex > -1) {
      const newQuantity = cart.items[itemIndex].quantity + requestedQuantity;
      if (merchandise.stock < newQuantity) return res.status(400).json({ message: "Not enough stock for total quantity" });
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ merchandise: merchandiseId, quantity: requestedQuantity });
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate("items.merchandise");
    res.status(200).json(populatedCart);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    if (!ensureAttendee(req, res)) return;
    const quantity = Number(req.body.quantity);
    const { itemId } = req.params;
    if (!quantity || quantity <= 0) return res.status(400).json({ message: "Quantity must be greater than 0" });

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    const itemIndex = cart.items.findIndex((item) => item.merchandise.toString() === itemId);
    if (itemIndex === -1) return res.status(404).json({ message: "Item not in cart" });

    const merchandise = await Merchandise.findById(itemId);
    if (!merchandise) return res.status(404).json({ message: "Merchandise not found" });
    if (merchandise.stock < quantity) return res.status(400).json({ message: "Not enough stock available" });

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate("items.merchandise");
    res.status(200).json(populatedCart);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    if (!ensureAttendee(req, res)) return;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.items = cart.items.filter((item) => item.merchandise.toString() !== req.params.itemId);
    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate("items.merchandise");
    res.status(200).json(populatedCart);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const clearCart = async (req, res) => {
  try {
    if (!ensureAttendee(req, res)) return;
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
