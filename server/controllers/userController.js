const mongoose = require("mongoose");
const User = require("../models/User");
const Event = require("../models/Event");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort("-createdAt");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["attendee", "organizer", "admin"].includes(role)) return res.status(400).json({ message: "Invalid role" });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.role = role;
    await user.save();
    res.status(200).json({ message: "User role updated", user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const addFavorite = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(eventId)) return res.status(400).json({ message: "Invalid event ID" });
    const event = await Event.findById(eventId);
    if (!event || event.status !== "approved") return res.status(404).json({ message: "Approved event not found" });

    const user = await User.findById(req.user._id);
    const alreadyExists = user.favorites.some((id) => id.toString() === eventId);
    if (!alreadyExists) {
      user.favorites.push(eventId);
      await user.save();
    }
    const populated = await User.findById(req.user._id).populate("favorites").select("favorites");
    res.status(200).json({ message: alreadyExists ? "Event is already in favorites" : "Event added to favorites", favorites: populated.favorites });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.favorites = user.favorites.filter((id) => id.toString() !== req.params.eventId);
    await user.save();
    const populated = await User.findById(req.user._id).populate("favorites").select("favorites");
    res.status(200).json({ message: "Event removed from favorites", favorites: populated.favorites });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({ path: "favorites", match: { status: "approved" } });
    res.status(200).json(user.favorites.filter(Boolean));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getAllUsers, updateUserRole, deleteUser, addFavorite, removeFavorite, getFavorites };
