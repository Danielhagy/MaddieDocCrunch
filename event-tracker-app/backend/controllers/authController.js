const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      email: user.email,
      displayName: user.display_name || user.displayName
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

class AuthController {
  static async register(req, res) {
    try {
      const { username, email, password, confirmPassword, displayName } = req.body;

      console.log('ï¿½ï¿½ Registration attempt:', { username, email, displayName });

      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({ 
          error: 'Username, email, and password are required' 
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ 
          error: 'Passwords do not match' 
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          error: 'Password must be at least 6 characters long' 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'Please enter a valid email address' 
        });
      }

      // Validate username format
      if (username.length < 3) {
        return res.status(400).json({ 
          error: 'Username must be at least 3 characters long' 
        });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email) || await User.findByUsername(username);
      if (existingUser) {
        const field = existingUser.email === email ? 'email' : 'username';
        return res.status(400).json({ 
          error: `A user with this ${field} already exists` 
        });
      }

      // Create new user
      const user = await User.create({ username, email, password, displayName });
      const token = generateToken(user);

      console.log(`âœ… User registered successfully: ${username}`);

      res.status(201).json({
        message: 'Account created successfully',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName
        }
      });
    } catch (error) {
      console.error('âŒ Registration error:', error);
      res.status(500).json({ 
        error: error.message || 'Registration failed' 
      });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;

      console.log('í´ Login attempt:', { username });

      // Validate input
      if (!username || !password) {
        return res.status(400).json({ 
          error: 'Username and password are required' 
        });
      }

      // Find user by username or email
      let user = await User.findByUsername(username);
      if (!user) {
        user = await User.findByEmail(username);
      }

      if (!user) {
        console.log(`âŒ User not found: ${username}`);
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Validate password
      const isValid = await User.validatePassword(password, user.password_hash);
      if (!isValid) {
        console.log(`âŒ Invalid password for user: ${username}`);
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const token = generateToken(user);

      console.log(`âœ… User logged in successfully: ${username}`);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          avatarUrl: user.avatar_url
        }
      });
    } catch (error) {
      console.error('âŒ Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user statistics
      const stats = await User.getUserStats(req.user.id);

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          avatarUrl: user.avatar_url,
          stats
        }
      });
    } catch (error) {
      console.error('âŒ Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  static async logout(req, res) {
    try {
      // In a JWT system, logout is handled client-side by removing the token
      // But we can log it server-side for security auditing
      console.log(`í³¤ User logged out: ${req.user.username}`);
      
      res.json({
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('âŒ Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  // OAuth success handler (keeping for future OAuth integration)
  static async oauthSuccess(req, res) {
    try {
      const token = generateToken(req.user);
      
      // Redirect to frontend with token
      res.redirect(`http://localhost:3000/auth/success?token=${token}`);
    } catch (error) {
      console.error('âŒ OAuth success error:', error);
      res.redirect('http://localhost:3000/auth/error');
    }
  }
}

module.exports = AuthController;
