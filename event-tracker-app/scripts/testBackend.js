const http = require('http');

function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testBackend() {
  console.log('Ì∑™ Testing backend endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await testEndpoint('/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Response: ${JSON.stringify(health.data)}\n`);

    // Test general test endpoint
    console.log('2. Testing general test endpoint...');
    const test = await testEndpoint('/test');
    console.log(`   Status: ${test.status}`);
    console.log(`   Response: ${JSON.stringify(test.data)}\n`);

    // Test scraping endpoint
    console.log('3. Testing scraping endpoint...');
    const scraping = await testEndpoint('/scraping/analyze', 'POST', {
      url: 'https://example.com'
    });
    console.log(`   Status: ${scraping.status}`);
    console.log(`   Found events: ${scraping.data.events ? scraping.data.events.length : 'N/A'}\n`);

    console.log('‚úÖ Backend tests completed!');

  } catch (error) {
    console.error('‚ùå Backend test failed:', error.message);
    console.log('\nÌ≤° Make sure your backend server is running with: npm run dev');
  }
}

testBackend();
