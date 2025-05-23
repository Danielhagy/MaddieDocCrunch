const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const http = require("http");
require("dotenv").config();

// Import database and initialize
const {
  initializeDatabase,
  initializeTrackingTables,
} = require("./config/database");
const { setupWebSocket } = require("./config/websocket");

// Import routes
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const userRoutes = require("./routes/users");
const scrapingRoutes = require("./routes/scraping");
const trackingRoutes = require("./routes/tracking");

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:"],
      },
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api", limiter);

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [process.env.FRONTEND_URL, "https://your-app-name.onrender.com"]
      : ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/scraping", scrapingRoutes);
app.use("/api/tracking", trackingRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Serve static files from React app in production
if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "public");
  app.use(express.static(staticPath));

  // Catch all handler: send back React's index.html file for any non-API routes
  app.get("*", (req, res) => {
    // Skip API routes
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }

    res.sendFile(path.join(staticPath, "index.html"));
  });
} else {
  // Development mode - just serve a simple message
  app.get("/", (req, res) => {
    res.json({
      message: "DocumentCrunch Event Hub API is running",
      api: "/api",
      health: "/api/health",
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

const PORT = process.env.PORT || 3001;

// Initialize database and start server
async function startServer() {
  try {
    console.log("🔧 Initializing database...");
    await initializeDatabase();
    await initializeTrackingTables();

    console.log("🔌 Setting up WebSocket...");
    setupWebSocket(server);

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 DocumentCrunch Event Hub running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 API available at: http://localhost:${PORT}/api`);
      if (process.env.NODE_ENV === "production") {
        console.log(`🌐 Frontend served from: http://localhost:${PORT}`);
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

startServer();

module.exports = app;
