const cheerio = require("cheerio");
const XLSX = require("xlsx");

class ScrapingController {
  static async analyzeWebsite(req, res) {
    try {
      const { url } = req.body;
      console.log("Analyzing URL:", url);

      // Fetch the webpage
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract basic elements for general scraping
      const elements = {
        headings: [],
        paragraphs: [],
        links: [],
        images: [],
        tables: [],
        lists: [],
        divs: [],
      };

      // Extract headings
      $("h1, h2, h3, h4, h5, h6").each((i, elem) => {
        const $elem = $(elem);
        elements.headings.push({
          id: `heading_${i}`,
          tag: elem.tagName.toLowerCase(),
          preview: $elem.text().trim().substring(0, 100),
          classes: $elem.attr("class") || "",
        });
      });

      // Extract events (simple pattern matching)
      const events = [];

      // Look for common event patterns
      $(
        '.event, .conference, .meeting, [class*="event"], [class*="Conference"]'
      ).each((i, elem) => {
        const $elem = $(elem);
        const eventData = {
          id: `event_${i}`,
          name:
            $elem
              .find('h1, h2, h3, .title, [class*="title"]')
              .first()
              .text()
              .trim() || $elem.text().trim().substring(0, 50),
          date:
            $elem
              .find('[datetime], .date, [class*="date"]')
              .first()
              .text()
              .trim() || "Date not found",
          location:
            $elem
              .find('.location, .venue, [class*="location"]')
              .first()
              .text()
              .trim() || "Location not specified",
          description:
            $elem
              .find('p, .description, [class*="description"]')
              .first()
              .text()
              .trim() || "No description available",
          confidence: "Medium",
          source: "Pattern Detection",
        };

        if (eventData.name && eventData.name.length > 3) {
          events.push(eventData);
        }
      });

      // Look for structured data events
      $('script[type="application/ld+json"]').each((i, elem) => {
        try {
          const jsonData = JSON.parse($(elem).html());
          if (
            jsonData["@type"] === "Event" ||
            (Array.isArray(jsonData) &&
              jsonData.some((item) => item["@type"] === "Event"))
          ) {
            const eventItems = Array.isArray(jsonData)
              ? jsonData.filter((item) => item["@type"] === "Event")
              : [jsonData];

            eventItems.forEach((eventItem, idx) => {
              events.push({
                id: `structured_event_${i}_${idx}`,
                name: eventItem.name || "Structured Event",
                date:
                  eventItem.startDate ||
                  eventItem.datePublished ||
                  "Date not specified",
                location:
                  eventItem.location?.name ||
                  eventItem.location?.address?.addressLocality ||
                  "Location not specified",
                description:
                  eventItem.description || "No description available",
                confidence: "High",
                source: "Structured Data (JSON-LD)",
              });
            });
          }
        } catch (parseError) {
          console.log("Failed to parse JSON-LD:", parseError.message);
        }
      });

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

      console.log(`Found ${events.length} events on ${url}`);

      res.json({
        url,
        elements,
        totals,
        events: events.slice(0, 50), // Limit to 50 events
        fetchMethod:
          events.length > 0
            ? "Pattern Detection + Structured Data"
            : "HTML Analysis",
      });
    } catch (error) {
      console.error("Scraping error:", error);
      res.status(500).json({
        error: "Failed to analyze website",
        message: error.message,
        events: [],
        elements: {
          headings: [],
          paragraphs: [],
          links: [],
          images: [],
          tables: [],
          lists: [],
          divs: [],
        },
        totals: {
          total: 0,
          headings: 0,
          paragraphs: 0,
          links: 0,
          images: 0,
          tables: 0,
          lists: 0,
          divs: 0,
        },
      });
    }
  }

  static async extractToExcel(req, res) {
    try {
      const { selectedEvents } = req.body;

      if (!selectedEvents || selectedEvents.length === 0) {
        return res.status(400).json({ error: "No events selected for export" });
      }

      console.log(`Exporting ${selectedEvents.length} events to Excel`);

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Prepare data for Excel
      const excelData = selectedEvents.map((event) => ({
        "Event Name": event.name || "",
        Date: event.date || "",
        Time: event.time || "",
        Location: event.location || "",
        Description: event.description || "",
        Source: event.source || "",
        Confidence: event.confidence || "",
        URL: event.url || "",
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 30 }, // Event Name
        { wch: 15 }, // Date
        { wch: 10 }, // Time
        { wch: 25 }, // Location
        { wch: 50 }, // Description
        { wch: 20 }, // Source
        { wch: 10 }, // Confidence
        { wch: 30 }, // URL
      ];
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Events");

      // Generate buffer
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `DocumentCrunch_Events_${timestamp}.xlsx`;

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.send(buffer);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({
        error: "Failed to create Excel file",
        message: error.message,
      });
    }
  }
}

module.exports = ScrapingController;
