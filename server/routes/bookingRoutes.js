const express = require("express");
const router = express.Router();

const { createBooking, payBooking, getMyBookings, getEventAttendees } = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.use(protect);

router.post("/", createBooking);
router.get("/my-bookings", getMyBookings);
router.get("/event/:eventId", authorizeRoles("organizer", "admin"), getEventAttendees);
router.get("/event/:eventId/attendees", authorizeRoles("organizer", "admin"), getEventAttendees);
router.post("/:id/pay", authorizeRoles("attendee"), payBooking);

module.exports = router;
