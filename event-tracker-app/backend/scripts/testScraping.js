const { scrapingService } = require('../services/scrapingService');

async function testScraping() {
  const testUrls = [
    'https://example.com',  // Simple test page
    'https://httpbin.org/html',  // Another simple test
    'https://www.eventbrite.com/d/ca--san-francisco/events/',
    'https://events.stanford.edu/'
  ];

  for (const url of testUrls) {
    try {
      console.log(`\n� Testing: ${url}`);
      console.log('⏳ Scraping events...');
      
      const events = await scrapingService.scrapeEvents(url);
      console.log(`✅ Found ${events.length} events`);
      
      if (events.length > 0) {
        console.log('� First few events:');
        events.slice(0, 3).forEach((event, index) => {
          console.log(`   ${index + 1}. ${event.name}`);
          console.log(`      Date: ${event.date || 'N/A'}`);
          console.log(`      Source: ${event.source}`);
          console.log(`      Confidence: ${event.confidence}`);
        });
      } else {
        console.log('ℹ️  No events found - this might be normal for non-event pages');
      }
    } catch (error) {
      console.error(`❌ Error scraping ${url}:`, error.message);
    }
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n� Scraping test complete');
  await scrapingService.closeBrowser();
  process.exit(0);
}

testScraping();
