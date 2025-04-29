const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user.js');
const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
  const { fullname, email, password } = req.body;

  // Basic validation
  if (!fullname || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    
    // Automatically log in user after signup
    req.session.user = {
      id: newUser._id,
      email: newUser.email,
      fullname: newUser.fullname
    };

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser._id,
        email: newUser.email,
        fullname: newUser.fullname
      },
      redirectUrl: '/' // Redirect to home page after signup
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message:  'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Save user info in session
    req.session.user = {
      id: user._id,
      email: user.email,
      fullname: user.fullname,
    };

    console.log('Login successful for user:', user.email);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname
      },
      redirectUrl: '/' // Redirect to home page after login
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Logout Route
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        success: false,
        message: 'Could not log out'
      });
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      redirectUrl: '/loginpage/public/index.html'
    });
  });
});

// Check Auth Status
router.get('/status', (req, res) => {
  if (req.session.user) {
    res.status(200).json({
      success: true,
      user: req.session.user
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
});

module.exports = router;