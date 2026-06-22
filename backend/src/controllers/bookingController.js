const Booking = require("../models/Booking");
const { sendOtpEmail, sendBookingEmail } = require("../utils/mail");
const OTP = require("../models/Otp");
const Event = require("../models/Event");

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.user._id,
    }).populate("eventId");
 
    if (bookings.length === 0) {
      return res.status(404).json({ error: "No Bookings Found" });
    }

    return res.status(200).json({
      message: "Bookings Fetched Successfully",
      bookings,
    });
  } catch (err) {
    console.error("Booking View Error", err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const getAllBookingsAdmin = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("eventId")
      .populate("userId", "name email");

    if (bookings.length === 0) {
      return res.status(404).json({ error: "No Bookings Found" });
    }

    return res.status(200).json({
      message: "Bookings Fetched Successfully",
      bookings,
    });
  } catch (err) {
    console.error("Booking View Error", err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const bookingOtp = async (req, res) => {
  try {
    const otp = generateOtp();

    await OTP.deleteMany({
      email: req.user.email,
      action: "event_booking",
    });

    await OTP.create({
      email: req.user.email,
      otp,
      action: "event_booking",
    });

    await sendOtpEmail(req.user.email, req.user.name, otp, "event_booking");

    return res.status(200).json({
      message: "OTP Sent to mail",
    });
  } catch (err) {
    console.error("Booking OTP Error", err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const bookEvent = async (req, res) => {
  try {
    const { eventId, otp } = req.body;

    const record = await OTP.findOne({
      email: req.user.email,
      otp,
      action: "event_booking",
    });

    if (!record) {
      return res.status(400).json({
        error: "Invalid or Expired OTP",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event Not Found",
      });
    }

    if (event.availableSeats <= 0) {
      return res.status(400).json({
        error: "No Seats Available",
      });
    }

    const bookingExists = await Booking.findOne({
      userId: req.user._id,
      eventId,
    });

    if (bookingExists) {
      return res.status(400).json({
        message: "You already booked this event",
      });
    }

    const booking = await Booking.create({
      userId: req.user._id,
      eventId,
      status: "pending",
      paymentStatus: "unpaid",
      amount: event.price,
    });

    await OTP.deleteMany({
      email: req.user.email,
      action: "event_booking",
    });

    return res.status(201).json({
      message: "Booking Request Submittted",
      booking,
    });
  } catch (err) {
    console.error("Booking Error", err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const bookingStatus = async (req, res) => {
  try {
    const { paymentStatus, status } = req.body;

    const allowedPaymentStatuses = ["paid", "unpaid"];

    const allowedStatuses = ["pending", "confirmed", "cancelled"];

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        error: "Booking Not Found",
      });
    }

    const event = await Event.findById(booking.eventId);

    if (!event) {
      return res.status(404).json({
        error: "Event Not Found",
      });
    }

    if (paymentStatus) {
      if (!allowedPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          error: "Invalid Payment Status",
        });
      }

      booking.paymentStatus = paymentStatus;

      if (paymentStatus === "paid" && booking.status !== "confirmed") {
        if (event.availableSeats <= 0) {
          return res.status(400).json({
            error: "No Seats Available",
          });
        }

        booking.status = "confirmed";

        event.availableSeats -= 1;

        await event.save();

        await sendBookingEmail(req.user.email, req.user.name, event.title);
      }

      if (paymentStatus === "unpaid") {
        booking.status = "pending";
      }
    }

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          error: "Invalid Booking Status",
        });
      }

      if (status === "cancelled" && booking.status !== "cancelled") {
        event.availableSeats += 1;

        await event.save();
      }

      booking.status = status;
    }

    await booking.save();

    return res.status(200).json({
      message: "Booking Updated Successfully",
      booking,
    });
  } catch (err) {
    console.error("Booking Status Error", err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("eventId");

    if (!booking) {
      return res.status(404).json({
        message: "Booking Not Found",
      });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "Unauthorized",
      });
    }

    const event = await Event.findById(booking.eventId._id);

    if (event) {
      event.availableSeats += 1;

      await event.save();
    }

    await Booking.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Booking Cancelled Successfully",
    });
  } catch (err) {
    console.error("Booking Cancel Error", err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  getAllBookings,
  getAllBookingsAdmin,
  bookingStatus,
  bookEvent,
  cancelBooking,
  bookingOtp,
};
