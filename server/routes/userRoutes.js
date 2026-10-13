const express = require("express");
const router = express.Router();
const { getAllUsers, updateUserRole, deleteUser, addFavorite, removeFavorite, getFavorites } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// All user routes require auth
router.use(protect);

// Attendee Favorites Routes
router.post("/favorites/:eventId", authorizeRoles("attendee"), addFavorite);
router.delete("/favorites/:eventId", authorizeRoles("attendee"), removeFavorite);
router.get("/favorites", authorizeRoles("attendee"), getFavorites);

// Admin Routes
router.use(authorizeRoles("admin"));

router.route("/")
  .get(getAllUsers);

router.route("/:id")
  .delete(deleteUser);

router.route("/:id/role")
  .put(updateUserRole);

module.exports = router;
