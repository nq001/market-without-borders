const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/products', // The route is actually /products because CatalogController is mounted at /products? Wait, ProductsController is @Controller('products').
  method: 'GET',
};

const REQUESTS = 5000;
const CONCURRENCY = 100;
let completed = 0;
let errors = 0;
let active = 0;

console.log(`Starting load test: ${REQUESTS} requests at concurrency ${CONCURRENCY}...`);
const start = Date.now();

function next() {
  if (completed + active >= REQUESTS) return;
  active++;
  
  const req = http.request(options, (res) => {
    res.on('data', () => {});
    res.on('end', () => {
      if (res.statusCode !== 200) errors++;
      active--;
      completed++;
      
      if (completed === REQUESTS) {
        const duration = Date.now() - start;
        console.log(`\n--- Load Test Results ---`);
        console.log(`Total Time: ${duration}ms`);
        console.log(`Requests: ${REQUESTS}`);
        console.log(`Errors: ${errors}`);
        console.log(`Throughput: ${(REQUESTS / (duration / 1000)).toFixed(2)} req/sec`);
      } else {
        next();
      }
    });
  });
  
  req.on('error', (e) => {
    errors++;
    active--;
    completed++;
    next();
  });
  
  req.end();
}

for (let i = 0; i < CONCURRENCY; i++) {
  next();
}
