const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const validator = require('validator');
const XLSX = require('xlsx');
const fetch = require('node-fetch');

class ScrapingController {
  static async analyzeUrl(req, res) {
    try {
      const { url } = req.body;

      console.log('Ìæ™ Searching for real events at:', url);

      if (!url || !validator.isURL(url)) {
        return res.status(400).json({ 
          error: 'Please provide a valid URL (like https://example.com)' 
        });
      }

      // Fetch page content with multiple strategies
      let content;
      let fetchMethod = 'unknown';

      try {
        // Try fast HTTP fetch first
        console.log('Ì≥° Trying fast HTTP fetch...');
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          timeout: 15000
        });
        
        if (response.ok) {
          content = await response.text();
          fetchMethod = 'HTTP Fetch';
          console.log('‚úÖ HTTP fetch successful');
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (fetchError) {
        console.log('‚ö†Ô∏è HTTP fetch failed, using browser...', fetchError.message);
        
        // Fallback to Puppeteer for JavaScript-heavy sites
        try {
          console.log('Ì¥ñ Launching browser...');
          const browser = await puppeteer.launch({ 
            headless: 'new',
            args: [
              '--no-sandbox', 
              '--disable-setuid-sandbox',
              '--disable-web-security',
              '--disable-features=VizDisplayCompositor',
              '--disable-dev-shm-usage'
            ]
          });
          
          const page = await browser.newPage();
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
          await page.setViewport({ width: 1280, height: 720 });
          
          await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
          });

          // Wait a bit for any dynamic content
          await page.waitForTimeout(2000);
          
          content = await page.content();
          await browser.close();
          fetchMethod = 'Browser (Puppeteer)';
          console.log('‚úÖ Browser fetch successful');
        } catch (browserError) {
          console.error('‚ùå Browser fetch also failed:', browserError.message);
          throw new Error('Could not access this website. It might be protected or temporarily unavailable.');
        }
      }

      // Parse and intelligently detect events
      const $ = cheerio.load(content);
      const events = ScrapingController.detectEvents($, url); // Fixed: use class name instead of 'this'

      console.log(`Ìæâ Found ${events.length} events using ${fetchMethod}`);

      res.json({
        success: true,
        url,
        events,
        totalEvents: events.length,
        fetchMethod,
        message: events.length > 0 
          ? `Found ${events.length} events on this page` 
          : 'No events found on this page. Try a different URL or an events page.'
      });

    } catch (error) {
      console.error('‚ùå Error finding events:', error);
      res.status(500).json({ 
        error: 'Could not search this website for events. The site might be protected or temporarily unavailable.',
        details: error.message 
      });
    }
  }

  static detectEvents($, baseUrl) {
    const events = [];
    const seenEvents = new Set();

    console.log('Ì¥ç Starting intelligent event detection...');

    // Strategy 1: JSON-LD Structured Data (highest confidence)
    ScrapingController.findStructuredEvents($, events, baseUrl, seenEvents);
    console.log(`Ì≥ä Structured data found ${events.length} events`);
    
    // Strategy 2: Microdata and Schema.org
    ScrapingController.findMicrodataEvents($, events, baseUrl, seenEvents);
    console.log(`Ì≥ã Microdata found ${events.length} total events`);
    
    // Strategy 3: Event-specific patterns and containers
    ScrapingController.findPatternEvents($, events, baseUrl, seenEvents);
    console.log(`ÌæØ Pattern detection found ${events.length} total events`);
    
    // Strategy 4: Date-based content detection
    ScrapingController.findDateBasedEvents($, events, baseUrl, seenEvents);
    console.log(`Ì≥Ö Date-based detection found ${events.length} total events`);

    // Strategy 5: Calendar and time-based content
    ScrapingController.findCalendarEvents($, events, baseUrl, seenEvents);
    console.log(`Ì≥Ü Calendar detection found ${events.length} total events`);

    return events.slice(0, 50); // Limit to 50 events max
  }

  static findStructuredEvents($, events, baseUrl, seenEvents) {
    $('script[type="application/ld+json"]').each((i, script) => {
      try {
        const data = JSON.parse($(script).html());
        const eventArray = Array.isArray(data) ? data : [data];
        
        eventArray.forEach(item => {
          if (item['@type'] === 'Event' || 
              (item['@graph'] && item['@graph'].some(g => g['@type'] === 'Event'))) {
            
            const eventData = item['@type'] === 'Event' ? item : 
                             item['@graph'].find(g => g['@type'] === 'Event');
                             
            if (eventData) {
              const eventSignature = `${eventData.name}_${eventData.startDate}`;
              if (!seenEvents.has(eventSignature) && eventData.name) {
                events.push({
                  id: `structured_${events.length}`,
                  type: 'Structured Event Data',
                  name: ScrapingController.cleanText(eventData.name),
                  date: ScrapingController.formatDate(eventData.startDate),
                  time: ScrapingController.extractTime(eventData.startDate),
                  description: ScrapingController.cleanText(eventData.description) || 'No description available',
                  location: ScrapingController.formatLocation(eventData.location) || 'Location not specified',
                  url: eventData.url || baseUrl,
                  source: 'Structured Data (JSON-LD)',
                  confidence: 'High'
                });
                seenEvents.add(eventSignature);
              }
            }
          }
        });
      } catch (e) {
        // Skip invalid JSON
      }
    });
  }

  static findMicrodataEvents($, events, baseUrl, seenEvents) {
    $('[itemtype*="Event"], [itemtype*="event"]').each((i, container) => {
      const $container = $(container);
      const name = $container.find('[itemprop="name"]').text().trim() ||
                   $container.find('[itemprop="title"]').text().trim();
      
      if (name && name.length > 3) {
        const startDate = $container.find('[itemprop="startDate"]').attr('datetime') ||
                         $container.find('[itemprop="startDate"]').text().trim();
        
        const eventSignature = `${name}_${startDate}`;
        if (!seenEvents.has(eventSignature)) {
          events.push({
            id: `microdata_${events.length}`,
            type: 'Microdata Event',
            name: ScrapingController.cleanText(name),
            date: ScrapingController.formatDate(startDate),
            time: ScrapingController.extractTime(startDate),
            description: ScrapingController.cleanText($container.find('[itemprop="description"]').text()) || 'No description available',
            location: ScrapingController.cleanText($container.find('[itemprop="location"]').text()) || 'Location not specified',
            url: $container.find('[itemprop="url"]').attr('href') || baseUrl,
            source: 'Microdata',
            confidence: 'High'
          });
          seenEvents.add(eventSignature);
        }
      }
    });
  }

  static findPatternEvents($, events, baseUrl, seenEvents) {
    // Look for event-like containers with various selectors
    const eventSelectors = [
      '.event', '.event-item', '.event-card', '.event-listing',
      '.calendar-event', '.listing-item', '.event-row',
      '[class*="event"]', '[id*="event"]',
      '.post', '.article', '.item', '.card',
      '.workshop', '.conference', '.meeting', '.seminar',
      '.concert', '.show', '.performance', '.festival'
    ];

    eventSelectors.forEach(selector => {
      $(selector).each((i, container) => {
        const $container = $(container);
        
        // Skip if too small or likely not an event
        const text = $container.text().trim();
        if (text.length < 30) return;

        const event = ScrapingController.extractEventFromContainer($container, baseUrl, `pattern_${selector.replace(/[^a-zA-Z0-9]/g, '_')}_${i}`);
        if (event && event.name && event.name.length > 3) {
          const eventSignature = `${event.name}_${event.date}`;
          if (!seenEvents.has(eventSignature)) {
            events.push(event);
            seenEvents.add(eventSignature);
          }
        }
      });
    });
  }

  static findDateBasedEvents($, events, baseUrl, seenEvents) {
    // Enhanced date patterns
    const datePatterns = [
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}(?:st|nd|rd|th)?,?\s+(?:\d{4})?\b/gi,
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
      /\b\d{4}-\d{2}-\d{2}\b/g,
      /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}\b/gi
    ];

    $('*').contents().filter(function() {
      return this.nodeType === 3; // Text nodes
    }).each((i, textNode) => {
      const text = $(textNode).text();
      
      datePatterns.forEach(pattern => {
        const dateMatches = text.match(pattern);
        if (dateMatches) {
          dateMatches.forEach(dateMatch => {
            const $parent = $(textNode).parent();
            const $grandparent = $parent.parent();
            
            // Look in parent and grandparent for more context
            const searchContainer = $grandparent.length ? $grandparent : $parent;
            
            const event = ScrapingController.extractEventFromContainer(searchContainer, baseUrl, `date_${i}_${events.length}`, dateMatch);
            
            if (event && event.name && event.name.length > 3) {
              const eventSignature = `${event.name}_${event.date}`;
              if (!seenEvents.has(eventSignature)) {
                events.push(event);
                seenEvents.add(eventSignature);
              }
            }
          });
        }
      });
    });
  }

  static findCalendarEvents($, events, baseUrl, seenEvents) {
    // Look for calendar-specific structures
    const calendarSelectors = [
      '.calendar-item', '.cal-event', '.fc-event',
      '[class*="calendar"]', '[class*="cal-"]',
      '.day-event', '.week-event', '.month-event'
    ];

    calendarSelectors.forEach(selector => {
      $(selector).each((i, container) => {
        const $container = $(container);
        const event = ScrapingController.extractEventFromContainer($container, baseUrl, `calendar_${selector.replace(/[^a-zA-Z0-9]/g, '_')}_${i}`);
        
        if (event && event.name) {
          const eventSignature = `${event.name}_${event.date}`;
          if (!seenEvents.has(eventSignature)) {
            events.push(event);
            seenEvents.add(eventSignature);
          }
        }
      });
    });
  }

  static extractEventFromContainer($container, baseUrl, id, forcedDate = null) {
    // Extract event name with multiple strategies
    let name = '';
    const nameSelectors = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      '.title', '.name', '.event-title', '.event-name',
      '.headline', '.header', 'strong', 'b',
      '[class*="title"]', '[class*="name"]'
    ];
    
    for (const selector of nameSelectors) {
      const $nameEl = $container.find(selector).first();
      if ($nameEl.length && $nameEl.text().trim().length > 3) {
        name = ScrapingController.cleanText($nameEl.text());
        break;
      }
    }
    
    if (!name) {
      // Fallback: use first meaningful text
      const firstTexts = $container.text().trim().split('\n');
      for (const text of firstTexts) {
        if (text.trim().length > 10 && text.trim().length < 150) {
          name = ScrapingController.cleanText(text.trim());
          break;
        }
      }
    }

    // Extract date/time with enhanced detection
    let date = forcedDate || '';
    let time = '';
    
    if (!date) {
      const dateSelectors = [
        '.date', '.time', '.when', '.datetime',
        '[class*="date"]', '[class*="time"]', '[class*="when"]',
        '[datetime]', 'time'
      ];
      
      dateSelectors.forEach(selector => {
        if (!date) {
          const $dateEl = $container.find(selector);
          if ($dateEl.length) {
            const dateText = $dateEl.attr('datetime') || $dateEl.text().trim();
            if (ScrapingController.containsDate(dateText)) {
              date = ScrapingController.formatDate(dateText);
              time = ScrapingController.extractTime(dateText);
            }
          }
        }
      });
    }

    // If still no date, search all text more aggressively
    if (!date) {
      const allText = $container.text();
      const dateMatch = allText.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}(?:st|nd|rd|th)?,?\s+(?:\d{4})?\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/i);
      if (dateMatch) {
        date = ScrapingController.formatDate(dateMatch[0]);
      }
    }

    // Extract description with smart selection
    let description = '';
    const descSelectors = [
      '.description', '.summary', '.excerpt', '.content',
      '.event-description', '.event-summary',
      'p', '.text', '[class*="desc"]'
    ];
    
    for (const selector of descSelectors) {
      const $descEl = $container.find(selector).first();
      if ($descEl.length) {
        const descText = ScrapingController.cleanText($descEl.text());
        if (descText.length > 20 && descText.length < 800 && !descText.includes(name)) {
          description = descText;
          break;
        }
      }
    }

    // Extract location
    let location = '';
    const locationSelectors = [
      '.location', '.venue', '.address', '.where', '.place',
      '[class*="location"]', '[class*="venue"]', '[class*="address"]'
    ];
    
    locationSelectors.forEach(selector => {
      if (!location) {
        const $locEl = $container.find(selector);
        if ($locEl.length) {
          const locText = ScrapingController.cleanText($locEl.text());
          if (locText.length > 2 && locText.length < 200) {
            location = locText;
          }
        }
      }
    });

    // Extract URL
    let eventUrl = baseUrl;
    const $link = $container.find('a[href]').first();
    if ($link.length) {
      const href = $link.attr('href');
      if (href) {
        if (href.startsWith('http')) {
          eventUrl = href;
        } else if (href.startsWith('/')) {
          try {
            eventUrl = new URL(href, baseUrl).toString();
          } catch (e) {
            eventUrl = baseUrl + href;
          }
        }
      }
    }

    // Only return if we have at least a name
    if (name && name.length > 3) {
      return {
        id,
        type: 'Detected Event',
        name,
        date: date || 'Date not found',
        time: time || 'Time not specified',
        description: description || 'No description available',
        location: location || 'Location not specified', 
        url: eventUrl,
        source: 'Smart Detection',
        confidence: (date && description && location) ? 'High' : 
                   (date && (description || location)) ? 'Medium' : 'Low'
      };
    }

    return null;
  }

  // Helper methods - all static now
  static cleanText(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ')
               .replace(/[^\w\s\-.,!?:;()]/g, '')
               .trim()
               .substring(0, 300);
  }

  static containsDate(text) {
    if (!text) return false;
    return /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2})\b/i.test(text);
  }

  static formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch (e) {}
    return dateStr.substring(0, 50);
  }

  static extractTime(dateStr) {
    if (!dateStr) return '';
    const timeMatch = dateStr.match(/\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\b/);
    return timeMatch ? timeMatch[0] : '';
  }

  static formatLocation(location) {
    if (!location) return '';
    if (typeof location === 'string') return ScrapingController.cleanText(location);
    if (location.name) return ScrapingController.cleanText(location.name);
    if (location.address) {
      const addr = location.address;
      if (typeof addr === 'string') return ScrapingController.cleanText(addr);
      const parts = [
        addr.streetAddress,
        addr.addressLocality,
        addr.addressRegion,
        addr.addressCountry
      ].filter(Boolean);
      return ScrapingController.cleanText(parts.join(', '));
    }
    return '';
  }

  static async extractData(req, res) {
    try {
      const { url, selectedEvents } = req.body;

      if (!selectedEvents || selectedEvents.length === 0) {
        return res.status(400).json({ error: 'Please select at least one event to download' });
      }

      console.log(`Ì≥ä Creating Excel file with ${selectedEvents.length} events`);

      // Format data for Excel with enhanced columns
      const excelData = selectedEvents.map((event, index) => ({
        'Event #': index + 1,
        'Event Name': event.name || '',
        'Event Date': event.date || '',
        'Event Time': event.time || '', 
        'Description': event.description || '',
        'Location': event.location || '',
        'Website URL': event.url || '',
        'Data Source': event.source || '',
        'Detection Confidence': event.confidence || '',
        'Event Type': event.type || '',
        'Found From': url
      }));

      // Create Excel workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths for better readability
      ws['!cols'] = [
        { wch: 8 },   // Event #
        { wch: 35 },  // Event Name
        { wch: 15 },  // Event Date
        { wch: 12 },  // Event Time
        { wch: 60 },  // Description
        { wch: 30 },  // Location
        { wch: 40 },  // Website URL
        { wch: 20 },  // Data Source
        { wch: 15 },  // Confidence
        { wch: 20 },  // Event Type
        { wch: 40 }   // Found From
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Events Found');

      // Generate file
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
      const timestamp = new Date().toISOString().split('T')[0];
      const domain = new URL(url).hostname.replace('www.', '');
      const filename = `Events_${domain}_${timestamp}.xlsx`;

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      console.log(`‚úÖ Generated ${filename} with ${selectedEvents.length} events`);
      res.send(buffer);

    } catch (error) {
      console.error('‚ùå Excel generation error:', error);
      res.status(500).json({ 
        error: 'Failed to create Excel file',
        details: error.message 
      });
    }
  }
}

module.exports = ScrapingController;
