const Complaint = require("../models/Complaint");

// @route   POST /api/complaints
// @desc    Submit a complaint
// @access  Private
const submitComplaint = async (req, res) => {
  try {
    const { subject, description } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ message: "Subject and description are required" });
    }

    const complaint = await Complaint.create({
      user: req.user._id,
      subject,
      description,
    });

    res.status(201).json(complaint);
  } catch (err) {
    console.error("Submit complaint error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   GET /api/complaints/my-complaints
// @desc    Get user's complaints
// @access  Private
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id }).sort("-createdAt");
    res.status(200).json(complaints);
  } catch (err) {
    console.error("Get my complaints error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   GET /api/complaints
// @desc    Get all complaints (for Admin)
// @access  Private (Admin)
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate("user", "name email").sort("-createdAt");
    res.status(200).json(complaints);
  } catch (err) {
    console.error("Get all complaints error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   PUT /api/complaints/:id/respond
// @desc    Respond to and resolve a complaint (Admin)
// @access  Private (Admin)
const respondToComplaint = async (req, res) => {
  try {
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ message: "Response is required" });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { response, status: "Resolved" },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json(complaint);
  } catch (err) {
    console.error("Respond complaint error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  submitComplaint,
  getMyComplaints,
  getAllComplaints,
  respondToComplaint,
};
