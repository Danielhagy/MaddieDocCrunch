const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const XLSX = require("xlsx");

class ScrapingController {
  static async analyzeWebsite(req, res) {
    try {
      const { url } = req.body;

      // Simple implementation - you can expand this
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract basic elements
      const elements = {
        headings: [],
        paragraphs: [],
        links: [],
        images: [],
        tables: [],
        lists: [],
        divs: [],
      };

      // Extract events (basic implementation)
      const events = [];

      // Look for common event patterns
      $('[itemtype*="Event"], .event, .conference, .meeting').each(
        (i, elem) => {
          const $elem = $(elem);
          events.push({
            id: `event_${i}`,
            name:
              $elem.find("h1, h2, h3, .title").first().text().trim() || "Event",
            date:
              $elem.find("[datetime], .date").first().text().trim() ||
              "Date not found",
            location:
              $elem.find(".location, .venue").first().text().trim() ||
              "Location not specified",
            description:
              $elem.find("p, .description").first().text().trim() ||
              "No description available",
            confidence: "Medium",
            source: "Pattern Detection",
          });
        }
      );

      const totals = {
        total: Object.values(elements).reduce(
          (sum, arr) => sum + arr.length,
          0
        ),
        headings: elements.headings.length,
        paragraphs: elements.paragraphs.length,
        links: elements.links.length,
        images: elements.images.length,
        tables: elements.tables.length,
        lists: elements.lists.length,
        divs: elements.divs.length,
      };

      res.json({
        url,
        elements,
        totals,
        events,
        fetchMethod: "HTML Analysis",
      });
    } catch (error) {
      console.error("Scraping error:", error);
      res.status(500).json({ error: "Failed to analyze website" });
    }
  }

  static async extractToExcel(req, res) {
    try {
      const { selectedEvents } = req.body;

      if (!selectedEvents || selectedEvents.length === 0) {
        return res.status(400).json({ error: "No events selected" });
      }

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(selectedEvents);
      XLSX.utils.book_append_sheet(wb, ws, "Events");

      // Generate buffer
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="events.xlsx"'
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.send(buffer);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Failed to create Excel file" });
    }
  }
}

module.exports = ScrapingController;
