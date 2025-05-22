const { spawn } = require('child_process');
const path = require('path');

console.log('íº€ Starting DocumentCrunch Event Hub...');

// Change to backend directory and start the server
process.chdir(path.join(__dirname, 'backend'));

// Install dependencies first
console.log('í³¦ Installing dependencies...');
const install = spawn('npm', ['install'], { stdio: 'inherit' });

install.on('close', (code) => {
  if (code !== 0) {
    console.error('âŒ Failed to install dependencies');
    process.exit(1);
  }
  
  console.log('âœ… Dependencies installed, starting server...');
  
  // Start the server
  const server = spawn('node', ['server.js'], { stdio: 'inherit' });
  
  server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
    process.exit(code);
  });
});
