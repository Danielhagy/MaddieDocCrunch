export const OAUTH_PROVIDER = process.env.REACT_APP_OAUTH_PROVIDER || 'google';

export const OAUTH_PROVIDERS = {
  google: {
    name: 'Google',
    icon: 'fab fa-google',
    color: '#db4437'
  },
  github: {
    name: 'GitHub',
    icon: 'fab fa-github',
    color: '#333'
  },
  discord: {
    name: 'Discord',
    icon: 'fab fa-discord',
    color: '#5865f2'
  }
};

export const API_ENDPOINTS = {
  AUTH: '/auth',
  EVENTS: '/events',
  USERS: '/users'
};
