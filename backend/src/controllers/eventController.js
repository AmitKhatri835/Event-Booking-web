const Event = require("../models/Event");

const getAllEvents = async (req, res) => {
  try {
    const filters = {};

    if (req.query.category) {
      filters.category = req.query.category;
    }

    if (req.query.location) {
      filters.location = req.query.location;
    }

    if (req.query.search) {
      filters.title = {
        $regex: req.query.search,
        $options: "i",
      };
    }

    const events = await Event.find(filters).sort({
      date: 1,
    });

    return res.status(200).json({
      events,
    });
  } catch (err) {
    console.error("Event Error", err);

    return res.status(500).json({
      message: "Event Search Error",
    });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ 
        message: "Event Not Found",
      });
    }

    return res.status(200).json({
      event,
    });
  } catch (err) {
    console.error("Event Error", err);

    return res.status(500).json({
      message: "Event Search by Id Error",
    });
  }
};

const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      location,
      category,
      totalSeats,
      price,
      image,
    } = req.body;

    const existingEvent = await Event.findOne({
      title,
      date,
      location,
    });

    if (existingEvent) {
      return res.status(400).json({
        message: "Event Already Exists",
      });
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      category,
      totalSeats,
      availableSeats: totalSeats,
      price,
      image,
    });

    return res.status(201).json({
      message: "Event Created Successfully",
      event,
    });
  } catch (err) {
    console.error("Event Error", err);

    return res.status(500).json({
      message: "Event Create Error",
    });
  }
};

const updateEvent = async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedEvent) {
      return res.status(404).json({
        message: "Event Not Found",
      });
    }

    return res.status(200).json({
      message: "Event Updated Successfully",
      event: updatedEvent,
    });
  } catch (err) {
    console.error("Event Error", err);

    return res.status(500).json({
      message: "Event Update Error",
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event Not Found",
      });
    }

    return res.status(200).json({
      message: "Event Deleted Successfully",
    });
  } catch (err) {
    console.error("Event Error", err);

    return res.status(500).json({
      message: "Event Delete Error",
    });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
