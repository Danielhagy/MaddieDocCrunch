const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { db } = require('./database');

// JWT Strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, (payload, done) => {
  db.get('SELECT * FROM users WHERE id = ?', [payload.id], (err, user) => {
    if (err) return done(err, false);
    if (user) return done(null, user);
    return done(null, false);
  });
}));

// OAuth Strategy Setup
const strategyConfig = {
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.REDIRECT_URI
};

const oauthCallback = (accessToken, refreshToken, profile, done) => {
  const { id, displayName, emails, photos } = profile;
  const email = emails && emails[0] ? emails[0].value : null;
  const avatarUrl = photos && photos[0] ? photos[0].value : null;

  db.get('SELECT * FROM users WHERE oauth_id = ? AND oauth_provider = ?', 
    [id, process.env.OAUTH_PROVIDER], (err, existingUser) => {
    if (err) return done(err);
    
    if (existingUser) {
      return done(null, existingUser);
    }

    const stmt = db.prepare(`
      INSERT INTO users (oauth_id, oauth_provider, display_name, email, avatar_url)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run([id, process.env.OAUTH_PROVIDER, displayName, email, avatarUrl], function(err) {
      if (err) return done(err);
      
      db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, newUser) => {
        done(err, newUser);
      });
    });
  });
};

// Configure OAuth strategy based on provider
switch(process.env.OAUTH_PROVIDER) {
  case 'google':
    passport.use(new GoogleStrategy({
      ...strategyConfig,
      scope: ['profile', 'email']
    }, oauthCallback));
    break;
  case 'github':
    passport.use(new GitHubStrategy({
      ...strategyConfig,
      scope: ['user:email']
    }, oauthCallback));
    break;
  case 'discord':
    passport.use(new DiscordStrategy({
      ...strategyConfig,
      scope: ['identify', 'email']
    }, oauthCallback));
    break;
}

module.exports = passport;
