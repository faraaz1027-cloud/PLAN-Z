const Merchandise = require("../models/Merchandise");
const MerchandiseOrder = require("../models/MerchandiseOrder");
const Event = require("../models/Event");

const createMerchandise = async (req, res) => {
  try {
    const { name, description, productType = "General", image = "", price, stock = 0, eventId, event } = req.body;
    const targetEventId = eventId || event;

    if (!name || !description || price === undefined || !targetEventId) {
      return res.status(400).json({ message: "Name, description, price, and event are required" });
    }
    if (Number(price) <= 0) return res.status(400).json({ message: "Price must be positive" });
    if (Number(stock) < 0) return res.status(400).json({ message: "Stock cannot be negative" });

    const foundEvent = await Event.findById(targetEventId);
    if (!foundEvent) return res.status(404).json({ message: "Event not found" });
    if (foundEvent.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to add merchandise for this event" });
    }

    const merchandise = await Merchandise.create({
      name,
      description,
      productType,
      image,
      price: Number(price),
      stock: Number(stock),
      event: targetEventId,
      organizer: req.user._id,
    });
    res.status(201).json(merchandise);
  } catch (err) {
    console.error("Create merchandise error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAllMerchandise = async (req, res) => {
  try {
    const merchandise = await Merchandise.find().populate("event", "title status date").populate("organizer", "name email").sort("-createdAt");
    res.status(200).json(merchandise);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMerchandiseById = async (req, res) => {
  try {
    const merchandise = await Merchandise.findById(req.params.id).populate("event", "title status date").populate("organizer", "name email");
    if (!merchandise) return res.status(404).json({ message: "Merchandise not found" });
    res.status(200).json(merchandise);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMerchandiseByEvent = async (req, res) => {
  try {
    const merchandise = await Merchandise.find({ event: req.params.eventId }).sort("-createdAt");
    res.status(200).json(merchandise);
  } catch (err) {
    console.error("Get merchandise error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateMerchandise = async (req, res) => {
  try {
    const merchandise = await Merchandise.findById(req.params.id);
    if (!merchandise) return res.status(404).json({ message: "Merchandise not found" });
    if (merchandise.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this merchandise" });
    }
    if (req.body.price !== undefined && Number(req.body.price) <= 0) return res.status(400).json({ message: "Price must be positive" });
    if (req.body.stock !== undefined && Number(req.body.stock) < 0) return res.status(400).json({ message: "Stock cannot be negative" });

    const allowed = ["name", "description", "productType", "image", "price", "stock"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) merchandise[field] = req.body[field];
    });
    await merchandise.save();
    res.status(200).json(merchandise);
  } catch (err) {
    console.error("Update merchandise error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const deleteMerchandise = async (req, res) => {
  try {
    const merchandise = await Merchandise.findById(req.params.id);
    if (!merchandise) return res.status(404).json({ message: "Merchandise not found" });
    if (merchandise.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this merchandise" });
    }
    await Merchandise.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Merchandise deleted successfully" });
  } catch (err) {
    console.error("Delete merchandise error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const purchaseMerchandise = async (req, res) => {
  try {
    if (req.user.role !== "attendee") return res.status(403).json({ message: "Only attendees can purchase merchandise" });
    const { merchandiseId, quantity } = req.body;
    const requestedQuantity = Number(quantity);
    if (!merchandiseId || !requestedQuantity) return res.status(400).json({ message: "Merchandise ID and quantity are required" });
    if (requestedQuantity <= 0) return res.status(400).json({ message: "Quantity must be greater than 0" });

    const merchandise = await Merchandise.findById(merchandiseId);
    if (!merchandise) return res.status(404).json({ message: "Merchandise not found" });
    if (merchandise.stock < requestedQuantity) return res.status(400).json({ message: "Not enough stock available" });

    const totalPrice = merchandise.price * requestedQuantity;
    const order = await MerchandiseOrder.create({
      user: req.user._id,
      merchandise: merchandiseId,
      quantity: requestedQuantity,
      totalPrice,
      status: "Completed",
    });

    merchandise.stock -= requestedQuantity;
    await merchandise.save();
    res.status(201).json(order);
  } catch (err) {
    console.error("Purchase merchandise error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMyMerchandiseOrders = async (req, res) => {
  try {
    const orders = await MerchandiseOrder.find({ user: req.user._id })
      .populate({ path: "merchandise", select: "name price event", populate: { path: "event", select: "title" } })
      .sort("-createdAt");
    res.status(200).json(orders);
  } catch (err) {
    console.error("Get my merchandise orders error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createMerchandise,
  getAllMerchandise,
  getMerchandiseById,
  getMerchandiseByEvent,
  updateMerchandise,
  deleteMerchandise,
  purchaseMerchandise,
  getMyMerchandiseOrders,
};
