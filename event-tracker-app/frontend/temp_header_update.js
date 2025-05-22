// Add this nav link to the Header.js nav-links section:
<Link 
  to="/tracking" 
  className={`nav-link ${isActive('/tracking') ? 'active' : ''}`}
>
  <i className="fas fa-radar"></i>
  URL Tracking
</Link>
