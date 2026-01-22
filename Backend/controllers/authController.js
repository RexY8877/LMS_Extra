const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { isDemoUser, getDemoUser } = require('../data/demoData');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'defaultsecret', {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  const { name, email, password, role, college, department } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  try {
    const user = await User.create({
      name,
      email,
      password,
      role,
      college,
      department,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        department: user.department,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if this is a demo user first
    if (isDemoUser(email)) {
      const demoUser = getDemoUser(email);
      
      // Simple password check for demo users (in production, this would be hashed)
      if (demoUser && demoUser.password === password) {
        res.json({
          _id: demoUser._id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
          college: demoUser.college,
          department: demoUser.department,
          avatar: demoUser.avatar,
          token: generateToken(demoUser._id),
          isDemo: true, // Flag to indicate this is a demo user
        });
        return;
      } else {
        res.status(401).json({ message: 'Invalid demo credentials' });
        return;
      }
    }

    // For non-demo users, use MongoDB (existing logic)
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        department: user.department,
        token: generateToken(user._id),
        isDemo: false,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    // Check if this is a demo user
    if (req.user.id.startsWith('demo_')) {
      const { getDemoUserById } = require('../data/demoData');
      const demoUser = getDemoUserById(req.user.id);
      
      if (demoUser) {
        res.json({
          _id: demoUser._id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
          college: demoUser.college,
          department: demoUser.department,
          avatar: demoUser.avatar,
          isDemo: true,
        });
        return;
      }
    }

    // For non-demo users, use MongoDB
    const user = await User.findById(req.user.id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        department: user.department,
        isDemo: false,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error getting user profile' });
  }
};

module.exports = { registerUser, authUser, getUserProfile };
