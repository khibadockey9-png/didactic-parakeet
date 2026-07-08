const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Health
app.get('/v1/health', (req, res) => res.json({ok: true}));

// Auth (stubs)
app.post('/v1/auth/signup', (req, res) => {
  // TODO: implement signup + Firebase integration
  res.json({message: 'signup stub'});
});

app.post('/v1/auth/login', (req, res) => {
  res.json({message: 'login stub'});
});

// Farm endpoints
app.get('/v1/farm/:userId', (req, res) => {
  res.json({message: 'farm state stub'});
});

app.post('/v1/farm/:userId/harvest', (req, res) => {
  // TODO: validate 8-hour rule, calculate honey, perform transaction atomically
  res.json({message: 'harvest stub', honeyGained: 0});
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API stub listening on ${PORT}`));
