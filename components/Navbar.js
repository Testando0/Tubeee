import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter();
  const [q, setQ] = useState('');

  // Sync input with URL query
  useEffect(() => {
    if (router.query.q) setQ(router.query.q);
  }, [router.query.q]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <Link href="/" className="logo">
          <div className="logo__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <span className="logo__text">RubiTube</span>
        </Link>

        {/* Search */}
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-box">
            <input
              className="search-input"
              type="search"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar vídeos..."
              aria-label="Buscar vídeos"
            />
            <button type="submit" className="search-btn" aria-label="Buscar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
          </div>
        </form>

        {/* Badge */}
        <div className="nav-badge">
          <span className="pulse-dot"/>
          Sem anúncios
        </div>
      </div>
    </nav>
  );
}
