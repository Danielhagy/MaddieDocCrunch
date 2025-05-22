const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

// HTTP client using built-in https/http
const https = require('https');
const http = require('http');
const { URL } = require('url');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          text: () => Promise.resolve(data),
          statusCode: res.statusCode
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

class ScrapingService {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
    }
    return this.browser;
  }

  async scrapeEvents(url) {
    try {
      console.log(`í´ Starting to scrape events from: ${url}`);
      let events = [];
      
      // Method 1: Try to get structured data first (JSON-LD)
      console.log('í³Š Trying structured data extraction...');
      events = await this.scrapeStructuredData(url);
      console.log(`í³Š Structured data found: ${events.length} events`);
      
      if (events.length === 0) {
        // Method 2: Use Puppeteer for dynamic content
        console.log('í¾­ Trying dynamic content scraping...');
        events = await this.scrapeDynamicContent(url);
        console.log(`í¾­ Dynamic content found: ${events.length} events`);
      }
      
      if (events.length === 0) {
        // Method 3: Basic HTML scraping with cheerio
        console.log('í·¹ Trying basic HTML scraping...');
        events = await this.scrapeBasicHTML(url);
        console.log(`í·¹ Basic HTML found: ${events.length} events`);
      }

      if (events.length === 0) {
        // Method 4: Aggressive pattern matching
        console.log('í´Ž Trying aggressive pattern matching...');
        events = await this.scrapeAggressivePatterns(url);
        console.log(`í´Ž Pattern matching found: ${events.length} events`);
      }

      // Remove duplicates
      events = this.removeDuplicates(events);

      console.log(`âœ… Total unique events found: ${events.length}`);
      return events;
    } catch (error) {
      console.error('Scraping error for', url, ':', error);
      return [];
    }
  }

  async scrapeStructuredData(url) {
    try {
      const response = await httpGet(url);
      
      if (!response.ok) {
        console.log(`HTTP ${response.statusCode} for ${url}`);
        return [];
      }
      
      const html = await response.text();
      const $ = cheerio.load(html);
      const events = [];

      // Look for JSON-LD structured data
      $('script[type="application/ld+json"]').each((i, elem) => {
        try {
          const jsonData = JSON.parse($(elem).html());
          const extractedEvents = this.extractEventsFromStructuredData(jsonData);
          events.push(...extractedEvents);
        } catch (e) {
          // Skip invalid JSON
        }
      });

      return events;
    } catch (error) {
      console.error('Structured data scraping error:', error.message);
      return [];
    }
  }

  async scrapeDynamicContent(url) {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Wait for potential dynamic content
      await page.waitForTimeout(3000);
      
      // Execute the extraction in browser context
      const events = await page.evaluate(() => {
        const events = [];
        
        // Define the extraction function inside browser context
        function extractEventFromContainer(container) {
          const getTextFromSelectors = (selectors) => {
            for (const sel of selectors) {
              const el = container.querySelector(sel);
              if (el && el.textContent.trim()) {
                return el.textContent.trim();
              }
            }
            return '';
          };

          const getTextFromClass = (className) => {
            const el = container.querySelector(`.${className}`);
            return el ? el.textContent.trim() : '';
          };

          // Try specific event calendar classes first
          const title = getTextFromClass('calEventTitle') ||
                       getTextFromClass('event-title') ||
                       getTextFromClass('title') ||
                       getTextFromSelectors(['h1', 'h2', 'h3', 'h4', '.name', '[class*="title"]']) ||
                       container.getAttribute('title');

          const date = getTextFromClass('calEventDate') ||
                      getTextFromClass('event-date') ||
                      getTextFromClass('date');

          const location = getTextFromClass('calEventLocation') ||
                          getTextFromClass('event-location') ||
                          getTextFromClass('location') ||
                          getTextFromClass('venue');

          const description = getTextFromClass('calEventDescription') ||
                             getTextFromClass('event-description') ||
                             getTextFromClass('description') ||
                             getTextFromSelectors(['p', '.summary']);

          // If no specific classes found, try generic extraction
          let name = title;
          if (!name || name.length < 3) {
            name = getTextFromSelectors([
              'h1', 'h2', 'h3', 'h4', '.title', '.name', 
              '[class*="title"]', '[class*="name"]'
            ]) || container.textContent.trim().split('\n')[0];
          }

          // Look for dates in text if not found in specific fields
          let eventDate = date;
          if (!eventDate) {
            const fullText = container.textContent;
            const dateRegex = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b|\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/gi;
            const dateMatch = fullText.match(dateRegex);
            eventDate = dateMatch ? dateMatch[0] : '';
          }

          // Look for times
          const fullText = container.textContent;
          const timeRegex = /\b\d{1,2}:\d{2}\s*(?:AM|PM)?\b/gi;
          const timeMatch = fullText.match(timeRegex);

          return {
            id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: name ? name.substring(0, 200) : '',
            description: description ? description.substring(0, 500) : '',
            date: eventDate,
            time: timeMatch ? timeMatch[0] : '',
            location: location,
            url: container.querySelector('a') ? container.querySelector('a').href : '',
            source: 'Dynamic Content',
            confidence: name && name.length > 10 ? 'High' : 'Medium'
          };
        }
        
        // Priority selectors - look for event containers first
        const eventContainerSelectors = [
          // Specific event calendar patterns
          '.eventList li',
          '.event-list li',
          '.calendar-events li',
          
          // Generic event containers
          '.event-item', '.event-card', '.event-listing', '.event',
          '[class*="event" i]', '[class*="Event"]',
          '.calendar-event', '.listing-item',
          
          // Fallback containers
          '.card', '.entry', '.post', '.item',
          'li', 'article', 'section'
        ];
        
        for (const selector of eventContainerSelectors) {
          try {
            const containers = document.querySelectorAll(selector);
            if (containers.length > 0) {
              console.log(`Found ${containers.length} containers with selector: ${selector}`);
              
              containers.forEach(container => {
                const eventData = extractEventFromContainer(container);
                if (eventData.name && eventData.name.length > 3) {
                  events.push(eventData);
                }
              });
              
              // If we found events with this selector, don't continue with less specific ones
              if (events.length > 0) {
                break;
              }
            }
          } catch (e) {
            // Continue with next selector if this one fails
          }
        }
        
        return events;
      });
      
      await page.close();
      return events;
    } catch (error) {
      console.error('Dynamic content scraping error:', error.message);
      return [];
    }
  }

  async scrapeBasicHTML(url) {
    try {
      const response = await httpGet(url);
      
      if (!response.ok) return [];
      
      const html = await response.text();
      const $ = cheerio.load(html);
      const events = [];

      // Priority selectors - look for event containers first
      const eventContainerSelectors = [
        // Specific event calendar patterns
        '.eventList li',
        '.event-list li', 
        '.calendar-events li',
        
        // Generic event containers
        '.event-item', '.event-card', '.event-listing', '.event',
        '[class*="event"]', '[class*="Event"]',
        '.calendar-event', '.listing-item',
        
        // Fallback containers  
        '.card', '.entry', '.post', '.item'
      ];

      for (const selector of eventContainerSelectors) {
        $(selector).each((i, elem) => {
          const event = this.extractEventFromCheerio($, elem);
          if (event.name && event.name.length > 3) {
            events.push(event);
          }
        });
        
        // If we found events with this selector, don't continue with less specific ones
        if (events.length > 0) {
          break;
        }
      }

      return events;
    } catch (error) {
      console.error('Basic HTML scraping error:', error.message);
      return [];
    }
  }

  async scrapeAggressivePatterns(url) {
    try {
      const response = await httpGet(url);
      
      if (!response.ok) return [];
      
      const html = await response.text();
      const $ = cheerio.load(html);
      const events = [];

      // Look for any element that might contain event information
      const potentialEventElements = ['li', 'div', 'article', 'section', 'tr'];

      potentialEventElements.forEach(tag => {
        $(tag).each((i, elem) => {
          const $elem = $(elem);
          const text = $elem.text().trim();
          
          // Skip if too short or too long
          if (text.length < 20 || text.length > 1000) return;
          
          // Look for date patterns
          const dateRegex = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b|\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/i;
          const hasDate = dateRegex.test(text);
          
          // Look for event-like keywords
          const eventKeywords = /\b(event|conference|meeting|workshop|seminar|webinar|session|talk|presentation|concert|festival|party|gathering)\b/i;
          const hasEventKeywords = eventKeywords.test(text);
          
          if (hasDate || hasEventKeywords) {
            const event = this.extractEventFromCheerio($, elem);
            if (event.name && event.name.length > 5) {
              event.source = 'Pattern Recognition';
              event.confidence = hasDate && hasEventKeywords ? 'High' : 'Low';
              events.push(event);
            }
          }
        });
      });

      return events.slice(0, 20); // Limit to 20 events max
    } catch (error) {
      console.error('Aggressive pattern scraping error:', error.message);
      return [];
    }
  }

  extractEventsFromStructuredData(data) {
    const events = [];
    
    if (Array.isArray(data)) {
      data.forEach(item => {
        events.push(...this.extractEventsFromStructuredData(item));
      });
    } else if (data && typeof data === 'object') {
      if (data['@type'] === 'Event' || data.type === 'Event') {
        events.push({
          id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: data.name || data.summary || 'Unnamed Event',
          description: data.description || '',
          date: data.startDate || data.startTime || '',
          time: data.startTime || '',
          location: data.location?.name || data.location?.address || data.location || '',
          url: data.url || '',
          source: 'Structured Data',
          confidence: 'High'
        });
      }
      
      // Recursively check nested objects
      Object.values(data).forEach(value => {
        if (typeof value === 'object') {
          events.push(...this.extractEventsFromStructuredData(value));
        }
      });
    }
    
    return events;
  }

  extractEventFromCheerio($, element) {
    const $elem = $(element);
    
    // Helper function to find text in element
    const findText = (selectors) => {
      for (const selector of selectors) {
        const found = $elem.find(selector).first().text().trim();
        if (found) return found;
      }
      return '';
    };

    // Helper function to find text by class name
    const findByClass = (className) => {
      const found = $elem.find(`.${className}`).first().text().trim();
      return found;
    };
    
    // Try specific event calendar classes first
    const title = findByClass('calEventTitle') ||
                 findByClass('event-title') ||
                 findByClass('title') ||
                 findText(['h1', 'h2', 'h3', 'h4', '.name', '.event-name']) ||
                 $elem.attr('title');

    const date = findByClass('calEventDate') ||
                findByClass('event-date') ||
                findByClass('date');

    const location = findByClass('calEventLocation') ||
                    findByClass('event-location') ||
                    findByClass('location') ||
                    findByClass('venue');

    const description = findByClass('calEventDescription') ||
                       findByClass('event-description') ||
                       findByClass('description') ||
                       findText(['p', '.summary']);
    
    // Fallback to generic extraction if specific classes not found
    let name = title;
    if (!name || name.length < 3) {
      name = findText(['h1', 'h2', 'h3', 'h4', '.title', '.name']) ||
             $elem.text().trim().split('\n')[0];
    }
    
    // Look for dates in text if not found in specific fields
    let eventDate = date;
    if (!eventDate) {
      const fullText = $elem.text();
      const dateRegex = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b|\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/i;
      const dateMatch = fullText.match(dateRegex);
      eventDate = dateMatch ? dateMatch[0] : '';
    }

    // Look for times
    const fullText = $elem.text();
    const timeRegex = /\b\d{1,2}:\d{2}\s*(?:AM|PM)?\b/i;
    const timeMatch = fullText.match(timeRegex);

    return {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name ? name.substring(0, 200) : '',
      description: description ? description.substring(0, 500) : '',
      date: eventDate,
      time: timeMatch ? timeMatch[0] : '',
      location: location,
      url: $elem.find('a').first().attr('href') || '',
      source: 'HTML Parsing',
      confidence: name && name.length > 10 ? 'Medium' : 'Low'
    };
  }

  removeDuplicates(events) {
    const uniqueEvents = [];
    const seenEvents = new Set();

    events.forEach(event => {
      // Create a signature based on name and date
      const signature = `${event.name.toLowerCase().trim()}-${event.date}`.replace(/\s+/g, ' ');
      
      if (!seenEvents.has(signature)) {
        seenEvents.add(signature);
        uniqueEvents.push(event);
      }
    });

    console.log(`í·¹ Removed ${events.length - uniqueEvents.length} duplicate events`);
    return uniqueEvents;
  }

  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

const scrapingService = new ScrapingService();
module.exports = { scrapingService };
