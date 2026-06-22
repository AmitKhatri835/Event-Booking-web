// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");

// const connectDB = require("./config/db");

// const authRoutes = require("./routes/authRoutes");
// const eventRoutes = require("./routes/eventRoutes");
// const bookingRoutes = require("./routes/bookingRoutes");

// if (!process.env.JWT_SECRET) {
//   throw new Error("JWT_SECRET is missing in .env");
// }

// if (!process.env.MONGO_URI) {
//   throw new Error("MONGO_URI is missing in .env");
// }
// app.use(async (req, res, next) => {
//   try {
//     await connectDB();
//     next();
//   } catch (err) {
//     console.error("DB connection error:", err);
//     res.status(500).json({ error: "Database connection failed" });
//   }
// });
// const app = express();

// app.use(express.json());

// const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
//   "http://localhost:5173",
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   }),
// );

// app.use("/api/auth", authRoutes);

// app.use("/api/events", eventRoutes);

// app.use("/api/booking", bookingRoutes);

// app.get("/", (req, res) => {
//   return res.status(200).json({
//     message: "API Running Successfully",
//   });
// });

// const produce = process.env.NODE_ENV === "production";

// module.exports = app;

// if (!produce) {
//   const port = process.env.PORT || 5000;
//   app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
//   });
// }

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); // use the cached version
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

// Validate environment (optional, but safe to keep)
if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error("Missing required env vars. Check Vercel settings.");
  // In serverless, you might want to throw, but it's better to let the first request fail gracefully
}

const app = express();
app.use(express.json());

// CORS configuration
const defaultOrigins = ["http://localhost:5173"];
const envOrigins =
  process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) || [];
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Middleware to connect to DB on first request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("MongoDB connection error:", err);
    res.status(500).json({ error: "Database unavailable" });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/booking", bookingRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "API Running Successfully" });
});

// Export for Vercel (no listen in production)
module.exports = app;

// Optional: for local development, start the server
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
