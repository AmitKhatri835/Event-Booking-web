const express = require("express");
const router = express.Router();
const { authMiddleware, admin } = require("../middleware/auth");
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} = require("../controllers/eventController");

// get all events
router.get("/", getAllEvents);

// get event by id
router.get("/:id", getEventById);

// create event - admin only
router.post("/", authMiddleware, admin, createEvent);

// update event - admin only
router.put("/:id", authMiddleware, admin, updateEvent);

// delete event - admin only
router.delete("/:id", authMiddleware, admin, deleteEvent);

module.exports = router;
