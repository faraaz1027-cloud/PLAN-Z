const express = require("express");
const router = express.Router();

const {
  createMerchandise,
  getAllMerchandise,
  getMerchandiseById,
  getMerchandiseByEvent,
  updateMerchandise,
  deleteMerchandise,
  purchaseMerchandise,
  getMyMerchandiseOrders,
} = require("../controllers/merchandiseController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// Public list routes
router.get("/", getAllMerchandise);
router.get("/event/:eventId", getMerchandiseByEvent);

// Protected routes that must come before /:id
router.post("/purchase", protect, authorizeRoles("attendee"), purchaseMerchandise);
router.get("/orders/my-orders", protect, authorizeRoles("attendee"), getMyMerchandiseOrders);
router.get("/my-orders", protect, authorizeRoles("attendee"), getMyMerchandiseOrders);

// Organizer routes
router.post("/", protect, authorizeRoles("organizer"), createMerchandise);
router.put("/:id", protect, authorizeRoles("organizer"), updateMerchandise);
router.delete("/:id", protect, authorizeRoles("organizer"), deleteMerchandise);

// Public single item route last
router.get("/:id", getMerchandiseById);

module.exports = router;
