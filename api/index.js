const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const appointmentRoutes = require("../src/routes/appointment.routes");

const { errorHandler } = require("../src/middleware/errorHandler");
const { setupLogging } = require("../src/config/logging");
const { initializeFirebase } = require("../src/config/firebase");
const { createUploadDirs } = require("../src/config/upload");
const routes = require("../src/routes");

// Initialize Express app
const app = express();

// Setup Winston logging
setupLogging();

// Initialize Firebase Admin SDK
initializeFirebase();

// Create upload directories
createUploadDirs();

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Serve uploaded files
app.use("/uploads", express.static(process.env.UPLOAD_PATH));

// Routes
app.use("/api", routes);

// Error handling
app.use(errorHandler);
app.get("/", (req, res) => {
  res.send("Welcome to the Medify API server!");
});

// Use appointment routes
app.use("/api", appointmentRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
