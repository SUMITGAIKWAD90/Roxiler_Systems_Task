import { Link } from 'react-router-dom';

export default function AuthLayout({ children, title, subtitle, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-page__blobs" aria-hidden>
        <span className="blob blob-1" />
        <span className="blob blob-2" />
        <span className="blob blob-3" />
      </div>

      <div className="auth-page__inner animate-fade-in">
        <Link to="/" className="auth-page__brand">
          <span className="auth-page__logo">★</span>
          <span>RateSpot</span>
        </Link>

        <div className="auth-card">
          <div className="auth-card__header">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {children}
        </div>

        {footer}
      </div>
    </div>
  );
}
