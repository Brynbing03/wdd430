'use client';

import { useState } from 'react';
import { fries, getRestaurantSlug } from '../lib/data/fries';
import AuthStatus from '../components/AuthStatus';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const visibleFries = fries.filter((fry) =>
    `${fry.name} ${fry.restaurant}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main>
      <nav className="site-nav" aria-label="Main navigation">
        <a className="brand" href="/">
          <span className="brand-mark">F</span>
          <span>FryRank</span>
        </a>
        <div className="nav-links">
          <a href="#browse">Browse fries</a>
          <a href="#about">About</a>
          <AuthStatus />
        </div>
      </nav>

      <section className="hero" id="about">
        <div className="hero-copy">
          <p className="eyebrow">The unofficial fry authority</p>
          <h1>Life is too short for <em>average</em> fries.</h1>
          <p className="hero-text">
            Find the best fast-food fries near you, then help the community decide
            which crispy, salty, golden strands deserve the top spot.
          </p>
          <a className="button" href="#browse">Explore the rankings <span aria-hidden="true">→</span></a>
        </div>
        <div className="hero-art" aria-label="Illustration of a carton of fries" role="img">
          <div className="fry f1" />
          <div className="fry f2" />
          <div className="fry f3" />
          <div className="fry f4" />
          <div className="fry f5" />
          <div className="carton">F</div>
          <span className="art-star star-one">✦</span>
          <span className="art-star star-two">✦</span>
        </div>
      </section>

      <section className="browse-section" id="browse">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Start exploring</p>
            <h2>Fry rankings</h2>
          </div>
          <label className="search-field">
            <span className="sr-only">Search fries</span>
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search restaurants..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
        <div className="fry-grid">
          {visibleFries.map((fry) => (
            <article className="fry-card" key={fry.name}>
              <div className={`fry-card-image ${fry.color}`}>
                <img src={fry.imageUrl} alt={`${fry.restaurant} ${fry.name}`} />
                <span className="score-badge">★ {fry.score}</span>
              </div>
              <div className="fry-card-content">
                <p className="card-kicker">Fast-food restaurant</p>
                <h3>{fry.restaurant}</h3>
                <p className="card-restaurant">{fry.name}</p>
                <p className="card-reviews">Community rating coming soon</p>
                <a className="text-button" href={`/fries/${getRestaurantSlug(fry.restaurant)}`}>View details <span aria-hidden="true">→</span></a>
              </div>
            </article>
          ))}
        </div>
        {visibleFries.length === 0 && <p className="empty-state">No fries match that search yet.</p>}
      </section>

      <footer className="site-footer">
        <span>FryRank</span>
        <span>Built for fry people, by fry people.</span>
      </footer>
    </main>
  );
}
