# Ìæâ Event Tracker App

A modern full-stack web application for tracking events with authentication, built with React and Node.js.

## Ìºü Features

- **Ì¥ê Complete Authentication System**
  - User registration with username/password
  - OAuth login (Google/GitHub/Discord)
  - JWT-based authentication
  - Protected routes

- **Ìæ® Modern UI Design**
  - Dark theme with vibrant accents
  - Responsive design
  - Smooth animations
  - Glassmorphism effects
  - Font Awesome icons

- **‚ö° Tech Stack**
  - **Frontend**: React, React Router, Axios
  - **Backend**: Node.js, Express, Passport.js
  - **Database**: SQLite
  - **Authentication**: JWT, OAuth 2.0
  - **Styling**: CSS3 with modern features

## Ì∫Ä Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   # Edit backend/.env with your OAuth credentials
   CLIENT_ID=your_oauth_client_id
   CLIENT_SECRET=your_oauth_client_secret
   OAUTH_PROVIDER=google  # or github, discord
   REDIRECT_URI=http://localhost:3001/auth/callback
   ```

3. **Start the application:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

## Ì≥Å Project Structure

```
event-tracker-app/
‚îú‚îÄ‚îÄ backend/
‚îÇ   ‚îú‚îÄ‚îÄ routes/          # API endpoints
‚îÇ   ‚îú‚îÄ‚îÄ controllers/     # Business logic
‚îÇ   ‚îú‚îÄ‚îÄ models/          # Database models
‚îÇ   ‚îú‚îÄ‚îÄ middleware/      # Authentication & validation
‚îÇ   ‚îú‚îÄ‚îÄ config/          # Database & OAuth config
‚îÇ   ‚îú‚îÄ‚îÄ utils/           # Helper functions
‚îÇ   ‚îî‚îÄ‚îÄ database/        # SQLite database
‚îú‚îÄ‚îÄ frontend/
‚îÇ   ‚îú‚îÄ‚îÄ src/
‚îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ components/  # React components
‚îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ pages/       # Main pages
‚îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ utils/       # Frontend utilities
‚îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ styles/      # CSS files
‚îÇ   ‚îî‚îÄ‚îÄ public/          # Static files
‚îî‚îÄ‚îÄ README.md
```

## Ì¥ß API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/oauth` - OAuth login
- `GET /api/auth/callback` - OAuth callback
- `GET /api/auth/profile` - Get user profile

### Events (Protected)
- `GET /api/events` - Get user events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

## Ìæ® UI Components

- **Authentication**: Login/Register forms with OAuth
- **Dashboard**: User stats and quick actions
- **Events**: Event management interface
- **Header**: Navigation with user menu
- **Cards**: Modern card components with hover effects

## Ì¥í Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation
- Rate limiting
- CORS protection
- Helmet security headers

## ÔøΩÔøΩ OAuth Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable Google+ API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `http://localhost:3001/auth/callback`

### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:3001/auth/callback`

### Discord OAuth
1. Go to [Discord Developer Portal](https://discord.com/developers/)
2. Create application and add OAuth2 redirect
3. Set redirect URI: `http://localhost:3001/auth/callback`

## Ì∫Ä Deployment

### Frontend (Netlify/Vercel)
```bash
cd frontend
npm run build
# Deploy build/ directory
```

### Backend (Heroku/Railway)
```bash
# Set environment variables
# Deploy backend/ directory
```

## Ì¥ù Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open pull request

## Ì≥ù License

This project is licensed under the MIT License.

## Ìæâ Credits

Built with ‚ù§Ô∏è using modern web technologies.
