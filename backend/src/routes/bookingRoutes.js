const express = require("express");
const router = express.Router();
const { authMiddleware, admin } = require("../middleware/auth");
const {
  getAllBookings,
  getAllBookingsAdmin,
  bookEvent,
  bookingStatus,
  cancelBooking,
  bookingOtp,
} = require("../controllers/bookingController");

router.post("/", authMiddleware, bookEvent);

// admin: get all bookings
router.get("/", authMiddleware, admin, getAllBookingsAdmin);

router.post("/send-otp", authMiddleware, bookingOtp);

// get all bookings
router.get("/my-bookings", authMiddleware, getAllBookings);

router.put("/:id", authMiddleware, admin, bookingStatus);

router.delete("/:id/", authMiddleware, cancelBooking);

module.exports = router;
