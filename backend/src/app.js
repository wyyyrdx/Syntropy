const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();


app.use(cors());                          
app.use(express.json());                  
app.use(express.urlencoded({ extended: true }));


app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', require('./routes'));

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  if (err && err.name === 'MulterError') {
    return res.status(400).json({ error: err.message });
  }
  if (err && err.message && err.message.includes('Unsupported file type')) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

module.exports = app;