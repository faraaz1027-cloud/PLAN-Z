const express = require("express");
const router = express.Router();

const {
  submitComplaint,
  getMyComplaints,
  getAllComplaints,
  respondToComplaint,
} = require("../controllers/complaintController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// All complaint routes require authentication
router.use(protect);

// User Routes
router.post("/", submitComplaint);
router.get("/my-complaints", getMyComplaints);

// Admin Routes
router.get("/", authorizeRoles("admin"), getAllComplaints);
router.put("/:id/respond", authorizeRoles("admin"), respondToComplaint);

module.exports = router;
