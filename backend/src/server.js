const express = require("express");
const cors = require("cors");
require("dotenv").config();

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

app.use(cors());

app.use("/api/auth", authRoutes);

app.use("/api/events", eventRoutes);

app.use("/api/booking", bookingRoutes);

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "API Running Successfully",
  });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
