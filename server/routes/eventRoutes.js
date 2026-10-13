const express = require("express");
const router = express.Router();

const {
  createEvent,
  getEvents,
  getEventById,
  getOrganizerEvents,
  updateEvent,
  cancelEvent,
  deleteEvent,
  getAllEventsAdmin,
  updateEventStatus,
  removeApprovedEvent,
  getEventSales,
  getAdminSales,
  getAdminActivity,
} = require("../controllers/eventController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// Admin routes must be before /:id routes
router.get("/admin/all", protect, authorizeRoles("admin"), getAllEventsAdmin);
router.get("/admin/sales", protect, authorizeRoles("admin"), getAdminSales);
router.get("/admin/activity", protect, authorizeRoles("admin"), getAdminActivity);
router.put("/admin/:id/status", protect, authorizeRoles("admin"), updateEventStatus);
router.put("/admin/:id/remove", protect, authorizeRoles("admin"), removeApprovedEvent);

// Organizer routes
router.get("/organizer/my-events", protect, authorizeRoles("organizer"), getOrganizerEvents);
router.get("/my-events", protect, authorizeRoles("organizer"), getOrganizerEvents);
router.get("/:eventId/sales", protect, authorizeRoles("organizer", "admin"), getEventSales);
router.put("/:id/cancel", protect, authorizeRoles("organizer"), cancelEvent);

// Public routes
router.get("/", getEvents);
router.get("/:id", getEventById);

// Create/update/remove routes
router.post("/", protect, authorizeRoles("organizer"), createEvent);
router.put("/:id", protect, authorizeRoles("organizer"), updateEvent);
router.put("/:id/remove", protect, authorizeRoles("admin"), removeApprovedEvent);
router.delete("/:id", protect, authorizeRoles("organizer", "admin"), deleteEvent);

module.exports = router;
