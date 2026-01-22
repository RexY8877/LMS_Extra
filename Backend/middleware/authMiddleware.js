const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getDemoUserById } = require('../data/demoData');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');

      // Check if this is a demo user first
      if (decoded.id.startsWith('demo_')) {
        const demoUser = getDemoUserById(decoded.id);
        if (demoUser) {
          req.user = {
            id: demoUser._id,
            name: demoUser.name,
            email: demoUser.email,
            role: demoUser.role,
            college: demoUser.college,
            department: demoUser.department,
            isDemo: true,
          };
          next();
          return;
        }
      }

      // For non-demo users, use MongoDB
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'college_admin' || req.user.role === 'super_admin')) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

const superAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as a super admin' });
  }
};

module.exports = { protect, admin, superAdmin };
