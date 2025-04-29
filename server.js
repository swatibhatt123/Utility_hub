const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5000',
  credentials: true
}));
app.use(bodyParser.json());

// Session configuration
app.use(session({
  secret: 'your_strong_secret_key_here',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/auth-app')
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.log(err));

// Static file serving
app.use(express.static(path.join(__dirname, '../client')));
app.use('/loginpage', express.static(path.join(__dirname, '../client/loginpage/public')));
app.use('/calculatorapp', express.static(path.join(__dirname, '../client/calculatorapp')));
app.use('/weatherapp', express.static(path.join(__dirname, '../client/weatherapp')));
app.use('/tictactoe', express.static(path.join(__dirname, '../client/tictactoe')));

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/loginpage/public/index.html');
}

// Routes
app.use('/api/auth', authRoutes);

// Protected routes
app.get('/', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json({ 
      email: req.session.user.email,
      fullname: req.session.user.fullname 
    });
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out.' });
    }
    res.clearCookie('connect.sid');
    res.redirect('/loginpage/public/index.html');
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));