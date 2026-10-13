const express = require("express");
const router = express.Router();
const { createOrder, getMyOrders, getOrderById } = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.use(protect);
router.post("/", authorizeRoles("attendee"), createOrder);
router.get("/my-orders", authorizeRoles("attendee"), getMyOrders);
router.get("/:id", getOrderById);

module.exports = router;
