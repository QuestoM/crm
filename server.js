const http = require('http');
const fs = require('fs');
const path = require('path');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  // Handle dashboard.html
  if (req.url === '/' || req.url === '/dashboard' || req.url === '/dashboard.html') {
    fs.readFile(path.join(__dirname, 'dashboard.html'), 'utf8', (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading dashboard.html');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }
  
  // Handle 404
  res.writeHead(404);
  res.end('Not found');
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Open your browser to view the dashboard');
}); 