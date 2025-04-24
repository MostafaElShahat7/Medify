const express = require('express');
const path = require('path');

const app = express();

// Add this line to serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ... rest of your existing code ... 