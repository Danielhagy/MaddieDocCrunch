const express = require("express");
const { body, validationResult } = require("express-validator");
const ScrapingController = require("../controllers/scrapingController");
const { authenticateJWT } = require("../middleware/auth");

const router = express.Router();

// Validation middleware for URL
const validateUrl = [
  body("url")
    .isURL({ require_protocol: true })
    .withMessage("Please provide a valid URL with protocol (http/https)"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Invalid URL provided",
        details: errors.array(),
      });
    }
    next();
  },
];

// Analyze website for events and elements
router.post("/analyze", validateUrl, ScrapingController.analyzeWebsite);

// Extract selected events/elements to Excel
router.post("/extract", validateUrl, ScrapingController.extractToExcel);

module.exports = router;
