const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const XLSX = require('xlsx');
const { URL } = require('url');

class ScrapingController {
  static async analyzeWebsite(req, res) {
    const { url } = req.body;
    let browser = null;

    try {
      console.log(`ï¿½ï¿½ Analyzing website: ${url}`);
      
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      await page.setDefaultTimeout(30000);
      await page.setViewport({ width: 1920, height: 1080 });

      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      await page.waitForTimeout(2000);

      const content = await page.content();
      const $ = cheerio.load(content);

      console.log(`í³„ Page loaded: ${$('title').text()}`);

      // Date-driven event detection
      const events = ScrapingController.findEventsByDates($, url);
      
      // Sort events by date (earliest first)
      const sortedEvents = ScrapingController.sortEventsByDate(events);
      
      const elements = ScrapingController.analyzePageElements($);
      const totals = ScrapingController.calculateTotals(elements);

      console.log(`âœ… Found ${sortedEvents.length} events with dates`);

      res.json({
        success: true,
        url,
        events: sortedEvents,
        elements,
        totals,
        fetchMethod: 'Date-Driven Detection',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Scraping error:', error);
      res.status(500).json({
        error: 'Failed to analyze website',
        details: error.message
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  static findEventsByDates($, baseUrl) {
    const events = [];
    let eventId = 1;

    console.log(`í³… Starting date-driven event detection...`);

    // Step 1: Look for JSON-LD structured data first (most reliable)
    $('script[type="application/ld+json"]').each((i, elem) => {
      try {
        const jsonData = JSON.parse($(elem).html());
        const structuredEvents = ScrapingController.extractFromJsonLD(jsonData, baseUrl);
        
        structuredEvents.forEach(event => {
          if (event.date && event.date !== 'Date not found') {
            events.push({
              id: `event_${eventId++}`,
              name: event.name,
              date: event.date,
              dateSort: event.dateSort, // For sorting
              description: event.description,
              source: 'Structured Data (JSON-LD)',
              confidence: 'High'
            });
          }
        });
        
        console.log(`ï¿½ï¿½ Found ${structuredEvents.length} structured events with dates`);
      } catch (e) {
        console.log(`í³Š JSON-LD parsing error: ${e.message}`);
      }
    });

    // Step 2: Look for microdata
    $('[itemtype*="Event"]').each((i, elem) => {
      const microEvent = ScrapingController.extractFromMicrodata($, elem, baseUrl);
      if (microEvent && microEvent.date && microEvent.date !== 'Date not found') {
        events.push({
          id: `event_${eventId++}`,
          name: microEvent.name,
          date: microEvent.date,
          dateSort: microEvent.dateSort,
          description: microEvent.description,
          source: 'Microdata Schema',
          confidence: 'High'
        });
      }
    });

    // Step 3: Find ALL elements that contain dates, then check if they're events
    console.log(`í³… Scanning all elements for date patterns...`);
    
    const datePatterns = [
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
      /\b\d{1,2}-\d{1,2}-\d{4}\b/g,
      /\b\d{4}-\d{2}-\d{2}\b/g,
      /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}[a-z]*[,\s]*\d{4}\b/gi,
      /\b\d{1,2}[a-z]*\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[,\s]*\d{4}\b/gi,
      /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)[,\s]+[a-z]*\s*\d{1,2}[a-z]*\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[,\s]*\d{4}\b/gi
    ];

    let elementsWithDates = 0;
    let eventsFromDates = 0;

    // Check every element that could contain text
    $('div, p, li, td, th, span, article, section, h1, h2, h3, h4, h5, h6').each((i, elem) => {
      const $elem = $(elem);
      const text = $elem.text().trim();
      
      // Skip if text is too short or too long
      if (text.length < 20 || text.length > 3000) return;

      // Check if this element contains a date
      const containsDate = datePatterns.some(pattern => pattern.test(text));
      
      if (containsDate) {
        elementsWithDates++;
        
        // Extract the actual date from the text
        const dateInfo = ScrapingController.extractDateFromText(text);
        
        if (dateInfo.formatted && dateInfo.formatted !== 'Date not found') {
          // Now check if this element with a date looks like an event
          if (ScrapingController.elementLooksLikeEvent($elem, text)) {
            eventsFromDates++;
            
            const name = ScrapingController.extractEventName($elem);
            const description = ScrapingController.extractComprehensiveDescription($elem, name, dateInfo.raw);
            
            const event = {
              id: `event_${eventId++}`,
              name: name,
              date: dateInfo.formatted,
              dateSort: dateInfo.sortable,
              description: description,
              source: 'Date Pattern Detection',
              confidence: 'Medium'
            };
            
            events.push(event);
            console.log(`í³… Found event: "${event.name}" on ${event.date}`);
          }
        }
      }
    });

    console.log(`í³… Found ${elementsWithDates} elements with dates, ${eventsFromDates} were events`);

    // Step 4: Look in table rows specifically (events are often in tables)
    console.log(`í³‹ Checking table rows for events with dates...`);
    
    let tableEvents = 0;
    $('table tr').each((i, row) => {
      if (i === 0) return; // Skip header row
      
      const $row = $(row);
      const rowText = $row.text().trim();
      
      if (rowText.length > 15) {
        const containsDate = datePatterns.some(pattern => pattern.test(rowText));
        
        if (containsDate) {
          const dateInfo = ScrapingController.extractDateFromText(rowText);
          
          if (dateInfo.formatted && dateInfo.formatted !== 'Date not found') {
            tableEvents++;
            
            const cells = $row.find('td, th').map((i, cell) => $(cell).text().trim()).get();
            const name = ScrapingController.findBestEventNameInCells(cells);
            const description = ScrapingController.createDescriptionFromCells(cells, name, dateInfo.raw);
            
            const event = {
              id: `event_${eventId++}`,
              name: name,
              date: dateInfo.formatted,
              dateSort: dateInfo.sortable,
              description: description,
              source: 'Table Row with Date',
              confidence: 'Medium'
            };
            
            events.push(event);
            console.log(`í³‹ Found table event: "${event.name}" on ${event.date}`);
          }
        }
      }
    });

    console.log(`í³‹ Found ${tableEvents} events in table rows`);

    // Simple deduplication - only remove events with identical names and dates
    const uniqueEvents = ScrapingController.removeDuplicateEvents(events);
    
    console.log(`í¾‰ Total unique events: ${uniqueEvents.length}`);
    
    return uniqueEvents;
  }

  static extractComprehensiveDescription($elem, eventName, dateText) {
    // Get all text from the element
    const fullText = $elem.text().trim();
    
    // Remove the event name and date from the description
    let description = fullText;
    
    if (eventName && eventName !== 'Event') {
      description = description.replace(eventName, '').trim();
    }
    
    if (dateText) {
      description = description.replace(dateText, '').trim();
    }
    
    // Clean up multiple spaces and newlines
    description = description.replace(/\s+/g, ' ').trim();
    
    // If we still have substantial content, use it
    if (description.length > 20) {
      return description.length > 400 ? description.substring(0, 400) + '...' : description;
    }
    
    // Fallback: try to get description from child elements
    const childTexts = [];
    $elem.find('p, div, span').each((i, child) => {
      const childText = $(child).text().trim();
      if (childText.length > 10 && 
          !childText.includes(eventName) && 
          !childText.includes(dateText)) {
        childTexts.push(childText);
      }
    });
    
    if (childTexts.length > 0) {
      const combined = childTexts.join(' ').trim();
      return combined.length > 400 ? combined.substring(0, 400) + '...' : combined;
    }
    
    return fullText.length > 20 ? 
      (fullText.length > 400 ? fullText.substring(0, 400) + '...' : fullText) : 
      'No additional details available';
  }

  static createDescriptionFromCells(cells, eventName, dateText) {
    // Combine all cells except the one with the event name and date
    const relevantCells = cells.filter(cell => {
      const trimmed = cell.trim();
      return trimmed.length > 5 && 
             trimmed !== eventName && 
             !trimmed.includes(dateText) &&
             !ScrapingController.isJustDate(trimmed);
    });
    
    if (relevantCells.length > 0) {
      const combined = relevantCells.join(' â€¢ ').trim();
      return combined.length > 400 ? combined.substring(0, 400) + '...' : combined;
    }
    
    return 'No additional details available';
  }

  static extractDateFromText(text) {
    const datePatterns = [
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/,
      /\b\d{1,2}-\d{1,2}-\d{4}\b/,
      /\b\d{4}-\d{2}-\d{2}\b/,
      /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}[a-z]*[,\s]*\d{4}\b/i,
      /\b\d{1,2}[a-z]*\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[,\s]*\d{4}\b/i,
      /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)[,\s]+[a-z]*\s*\d{1,2}[a-z]*\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[,\s]*\d{4}\b/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        const rawDate = match[0];
        try {
          // Try to create a proper Date object for sorting
          const dateObj = new Date(rawDate);
          
          if (!isNaN(dateObj.getTime())) {
            return {
              raw: rawDate,
              formatted: dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              sortable: dateObj.getTime() // Unix timestamp for easy sorting
            };
          }
        } catch (e) {
          // If parsing fails, return the raw match with a fallback sort value
        }
        
        return {
          raw: rawDate,
          formatted: rawDate,
          sortable: Date.now() // Fallback - put unparseable dates at current time
        };
      }
    }

    return {
      raw: '',
      formatted: 'Date not found',
      sortable: 0
    };
  }

  static sortEventsByDate(events) {
    return events.sort((a, b) => {
      // Sort by date (earliest first), then by confidence, then by name
      if (a.dateSort !== b.dateSort) {
        return a.dateSort - b.dateSort;
      }
      
      // If dates are the same, sort by confidence
      const confidenceOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      const aConf = confidenceOrder[a.confidence] || 0;
      const bConf = confidenceOrder[b.confidence] || 0;
      
      if (aConf !== bConf) {
        return bConf - aConf; // High confidence first
      }
      
      // If same confidence, sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
  }

  // Keep existing helper methods but remove dateSort from return objects where not needed
  static elementLooksLikeEvent($elem, text) {
    const lowerText = text.toLowerCase();
    
    const eventKeywords = [
      'event', 'conference', 'meeting', 'workshop', 'seminar', 'webinar',
      'session', 'talk', 'presentation', 'lecture', 'class', 'course',
      'training', 'summit', 'symposium', 'convention', 'expo', 'festival',
      'concert', 'show', 'performance', 'gathering', 'celebration'
    ];
    
    const hasEventKeyword = eventKeywords.some(keyword => lowerText.includes(keyword));
    const actionWords = ['register', 'rsvp', 'join', 'attend', 'signup', 'tickets', 'admission'];
    const hasActionWord = actionWords.some(word => lowerText.includes(word));
    const timeWords = ['time', 'when', 'am', 'pm', 'o\'clock'];
    const hasTimeWord = timeWords.some(word => lowerText.includes(word));
    const locationWords = ['location', 'venue', 'address', 'where', 'room', 'hall'];
    const hasLocationWord = locationWords.some(word => lowerText.includes(word));
    const hasHeading = $elem.find('h1, h2, h3, h4, h5, h6').length > 0;
    const hasLink = $elem.find('a').length > 0;
    const className = $elem.attr('class') || '';
    const hasEventClass = /event|calendar|schedule|meeting|conference/.test(className);
    
    return hasEventKeyword || hasActionWord || hasEventClass || 
           (hasHeading && (hasTimeWord || hasLocationWord || hasLink));
  }

  static extractEventName($elem) {
    const strategies = [
      () => $elem.find('h1').first().text().trim(),
      () => $elem.find('h2').first().text().trim(),
      () => $elem.find('h3').first().text().trim(),
      () => $elem.find('h4').first().text().trim(),
      () => $elem.find('.title, .name, .headline, .event-title, .event-name').first().text().trim(),
      () => $elem.find('[class*="title"], [class*="name"]').first().text().trim(),
      () => $elem.find('strong, b').first().text().trim(),
      () => $elem.find('a').first().text().trim(),
      () => {
        const lines = $elem.text().trim().split('\n').map(l => l.trim()).filter(l => l.length > 5);
        return lines[0] || '';
      }
    ];

    for (const strategy of strategies) {
      const name = strategy();
      if (name && name.length > 3 && name.length < 200) {
        if (!ScrapingController.isJustDate(name)) {
          return name;
        }
      }
    }

    return 'Event';
  }

  static findBestEventNameInCells(cells) {
    for (const cell of cells) {
      const trimmed = cell.trim();
      if (trimmed.length > 5 && trimmed.length < 200 && !ScrapingController.isJustDate(trimmed)) {
        if (!ScrapingController.looksLikeDateTimeOrLocation(trimmed)) {
          return trimmed;
        }
      }
    }
    
    return cells[0] || 'Table Event';
  }

  static isJustDate(text) {
    const datePatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,
      /^\d{1,2}-\d{1,2}-\d{4}$/,
      /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}[a-z]*[,\s]*\d{4}$/i
    ];
    
    return datePatterns.some(pattern => pattern.test(text.trim()));
  }

  static looksLikeDateTimeOrLocation(text) {
    const lowerText = text.toLowerCase().trim();
    
    if (ScrapingController.isJustDate(text)) return true;
    if (/^\d{1,2}:\d{2}\s*(am|pm)?$/i.test(text)) return true;
    if (/^(room|hall|building|center|auditorium)\s+\w+$/i.test(lowerText)) return true;
    
    return false;
  }

  static removeDuplicateEvents(events) {
    const unique = [];
    const seen = new Set();

    for (const event of events) {
      const key = `${event.name.toLowerCase().trim()}_${event.date}`.substring(0, 100);
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(event);
      }
    }

    return unique;
  }

  // Keep existing JSON-LD and microdata methods with dateSort added
  static extractFromJsonLD(data, baseUrl) {
    const events = [];
    
    const processItem = (item) => {
      if (!item) return;
      
      if (Array.isArray(item)) {
        item.forEach(processItem);
        return;
      }

      if (item['@type'] === 'Event' || (Array.isArray(item['@type']) && item['@type'].includes('Event'))) {
        let dateSort = 0;
        let formattedDate = 'Date not found';
        
        if (item.startDate) {
          try {
            const dateObj = new Date(item.startDate);
            if (!isNaN(dateObj.getTime())) {
              dateSort = dateObj.getTime();
              formattedDate = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long', 
                day: 'numeric'
              });
            }
          } catch (e) {
            // Use defaults
          }
        }
        
        events.push({
          name: item.name || 'Event',
          description: item.description || 'No description available',
          date: formattedDate,
          dateSort: dateSort
        });
      }

      Object.values(item).forEach(value => {
        if (typeof value === 'object') {
          processItem(value);
        }
      });
    };

    processItem(data);
    return events;
  }

  static extractFromMicrodata($, elem, baseUrl) {
    const $elem = $(elem);
    
    let dateSort = 0;
    let formattedDate = 'Date not found';
    const dateAttr = $elem.find('[itemprop="startDate"]').attr('datetime') || 
                     $elem.find('[itemprop="startDate"]').text().trim();
    
    if (dateAttr) {
      try {
        const dateObj = new Date(dateAttr);
        if (!isNaN(dateObj.getTime())) {
          dateSort = dateObj.getTime();
          formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      } catch (e) {
        formattedDate = dateAttr;
      }
    }
    
    return {
      name: $elem.find('[itemprop="name"]').text().trim() || 'Event',
      description: $elem.find('[itemprop="description"]').text().trim() || 'No description available',
      date: formattedDate,
      dateSort: dateSort
    };
  }

  // Keep all other existing methods unchanged...
  static analyzePageElements($) {
    return {
      headings: ScrapingController.extractElements($, 'h1, h2, h3, h4, h5, h6', 'heading'),
      paragraphs: ScrapingController.extractElements($, 'p', 'paragraph'),
      links: ScrapingController.extractElements($, 'a[href]', 'link'),
      images: ScrapingController.extractElements($, 'img[src]', 'image'),
      tables: ScrapingController.extractElements($, 'table', 'table'),
      lists: ScrapingController.extractElements($, 'ul, ol', 'list'),
      divs: ScrapingController.extractElements($, 'div', 'div')
    };
  }

  static extractElements($, selector, type) {
    const elements = [];
    
    $(selector).each((i, elem) => {
      if (i >= 100) return false;
      
      const $elem = $(elem);
      const text = $elem.text().trim();
      
      if (text.length > 10) {
        elements.push({
          id: `${type}_${i}`,
          tag: elem.tagName?.toLowerCase() || type,
          preview: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
          classes: $elem.attr('class') || ''
        });
      }
    });

    return elements;
  }

  static calculateTotals(elements) {
    const totals = {};
    let total = 0;
    
    Object.keys(elements).forEach(key => {
      totals[key] = elements[key].length;
      total += elements[key].length;
    });
    
    totals.total = total;
    return totals;
  }

  static async extractToExcel(req, res) {
    try {
      const { url, selectedEvents, selectedElements } = req.body;
      const wb = XLSX.utils.book_new();

      if (selectedEvents && selectedEvents.length > 0) {
        const eventsData = selectedEvents.map(event => ({
          'Event Name': event.name || '',
          'Date': event.date || '',
          'Description': event.description || '',
          'Source': event.source || '',
          'Confidence': event.confidence || ''
        }));

        const ws = XLSX.utils.json_to_sheet(eventsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Events');
      }

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Disposition', 'attachment; filename=extracted_events.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      res.send(buffer);

    } catch (error) {
      console.error('Excel generation error:', error);
      res.status(500).json({
        error: 'Failed to generate Excel file',
        details: error.message
      });
    }
  }

  // Keep existing tracking helper methods...
  static async testUrl(url) {
    try {
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setDefaultTimeout(10000);
      
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
        await browser.close();
        return { success: true };
      } catch (error) {
        await browser.close();
        return { success: false, error: error.message };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async quickScan(url) {
    try {
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setDefaultTimeout(15000);
      
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
        const content = await page.content();
        const $ = cheerio.load(content);
        
        let eventCount = 0;
        eventCount += $('script[type="application/ld+json"]').length;
        eventCount += $('[itemtype*="Event"]').length;
        
        const datePattern = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}\b/;
        $('*').each((i, elem) => {
          if (datePattern.test($(elem).text())) {
            eventCount++;
          }
        });
        
        await browser.close();
        return { success: true, eventCount };
        
      } catch (error) {
        await browser.close();
        return { success: false, eventCount: 0, error: error.message };
      }
    } catch (error) {
      return { success: false, eventCount: 0, error: error.message };
    }
  }

  static countEventsInJsonLD(data) {
    let count = 0;
    
    const processItem = (item) => {
      if (!item) return;
      
      if (Array.isArray(item)) {
        item.forEach(processItem);
        return;
      }

      if (item['@type'] === 'Event' || (Array.isArray(item['@type']) && item['@type'].includes('Event'))) {
        count++;
      }

      Object.values(item).forEach(value => {
        if (typeof value === 'object') {
          processItem(value);
        }
      });
    };

    processItem(data);
    return count;
  }
}

module.exports = ScrapingController;
