const app = require('./app');
const http = require('http');

const server = http.createServer(app);

server.listen(3003, () => {
  console.log('El SERVIDOR ANDA READY');
  console.log('http://localhost:3003');
});
