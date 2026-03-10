import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (router.query.q) setQ(String(router.query.q));
  }, [router.query.q]);

  const submit = (e) => {
    e.preventDefault();
    const v = q.trim();
    if (!v) return;
    router.push(`/search?q=${encodeURIComponent(v)}`);
    inputRef.current?.blur();
  };

  return (
    <header className="nav" role="banner">
      <div className="nav__inner">
        {/* Logo */}
        <Link href="/" className="logo" aria-label="RubiTube — Início">
          <div className="logo__mark" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <span className="logo__wordmark">RubiTube</span>
        </Link>

        {/* Search */}
        <form className="nav__search" onSubmit={submit} role="search">
          <div className="search-wrap">
            <label className="sr-only" htmlFor="search-input">Buscar vídeos</label>
            <input
              id="search-input"
              ref={inputRef}
              className="nav__input"
              type="search"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar vídeos..."
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" className="nav__btn" aria-label="Buscar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
          </div>
        </form>

        {/* Badge */}
        <div className="nav__badge" aria-label="Plataforma sem anúncios">
          <span className="live-dot" aria-hidden="true"/>
          Sem anúncios
        </div>
      </div>
    </header>
  );
}
