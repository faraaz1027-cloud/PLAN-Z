const express = require("express");
const router = express.Router();
const { mockPayment, getPaymentById } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.use(protect);
router.post("/mock", authorizeRoles("attendee"), mockPayment);
router.get("/:id", getPaymentById);

module.exports = router;
