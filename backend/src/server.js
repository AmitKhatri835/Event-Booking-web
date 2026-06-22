require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in .env");
}

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is missing in .env");
}

connectDB();

const app = express();

app.use(express.json());

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
  "https://eventora-web.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);


app.use("/api/auth", authRoutes);

app.use("/api/events", eventRoutes);

app.use("/api/booking", bookingRoutes);

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "API Running Successfully",
  });
});

const produce = process.env.NODE_ENV === "production";

module.exports = app;

if (!produce) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
