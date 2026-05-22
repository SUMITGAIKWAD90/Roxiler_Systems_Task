import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleLabels = {
  admin: 'Admin',
  user: 'User',
  store_owner: 'Store Owner',
};

const navByRole = {
  admin: [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/stores', label: 'Stores' },
    { to: '/password', label: 'Settings' },
  ],
  user: [
    { to: '/stores', label: 'Discover', end: true },
    { to: '/password', label: 'Settings' },
  ],
  store_owner: [
    { to: '/owner', label: 'My Store', end: true },
    { to: '/password', label: 'Settings' },
  ],
};

export default function Layout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = navByRole[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="container navbar__inner">
          <Link to="/" className="navbar__brand">
            <span className="navbar__logo">★</span>
            RateSpot
            {user && <span className="navbar__role">{roleLabels[user.role]}</span>}
          </Link>
          <nav className="navbar__nav">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="main-content">
        <div className="container">
          {title && (
            <div className="page-header animate-slide-up" style={{ marginBottom: subtitle ? undefined : '2rem' }}>
              <div>
                <h1 className="page-header__title">{title}</h1>
                {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
              </div>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
