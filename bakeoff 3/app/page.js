'use client';

import { useEffect, useMemo, useState } from 'react';
import { fries, getRestaurantSlug } from '../lib/data/fries';
import { createClient } from '../lib/supabase/client';
import AuthStatus from '../components/AuthStatus';
import FallbackImage from '../components/FallbackImage';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [restaurantFilter, setRestaurantFilter] = useState('all');
  const [styleFilter, setStyleFilter] = useState('all');
  const [sort, setSort] = useState('default');
  const [browseFries, setBrowseFries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('local');
  const [loadError, setLoadError] = useState('');
  const [supabase] = useState(() => createClient());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadBrowseData() {
      const [{ data: fryRows, error: fryError }, { data: ratingRows, error: ratingError }] = await Promise.all([
        supabase.from('fries').select('id, name, slug, style, image_url, created_at, restaurants(name, slug)').order('created_at', { ascending: false }),
        supabase.from('ratings').select('fry_id, score'),
      ]);

      if (!active) return;
      if (fryError || ratingError || !fryRows?.length) {
        setBrowseFries(fries.map((fry) => ({ ...fry, slug: getRestaurantSlug(fry.restaurant), score: Number(fry.score), reviewCount: fry.reviews || 0, createdAt: null })));
        setDataSource('local');
        setLoadError('Live rankings are unavailable right now, so we are showing the latest saved list.');
      } else {
        const ratingSummary = (ratingRows || []).reduce((summary, rating) => {
          const current = summary[rating.fry_id] || { total: 0, count: 0 };
          current.total += Number(rating.score) || 0;
          current.count += 1;
          summary[rating.fry_id] = current;
          return summary;
        }, {});
        setBrowseFries(fryRows.map((row) => {
          const summary = ratingSummary[row.id] || { total: 0, count: 0 };
          return {
            id: row.id,
            name: row.name,
            restaurant: row.restaurants?.name || 'Restaurant',
            restaurantSlug: row.restaurants?.slug,
            slug: row.restaurants?.slug,
            style: row.style || 'Classic cut',
            score: summary.count ? summary.total / summary.count : null,
            reviewCount: summary.count,
            color: 'gold',
            imageUrl: row.image_url,
            createdAt: row.created_at,
          };
        }));
        setDataSource('supabase');
        setLoadError('');
      }
      setLoading(false);
    }
    loadBrowseData();
    return () => { active = false; };
  }, [supabase]);

  const restaurantOptions = useMemo(() => [...new Set(browseFries.map((fry) => fry.restaurant).filter(Boolean))].sort(), [browseFries]);
  const styleOptions = useMemo(() => [...new Set(browseFries.map((fry) => fry.style).filter(Boolean))].sort(), [browseFries]);
  const visibleFries = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = browseFries.filter((fry) => {
      const searchable = `${fry.name} ${fry.restaurant} ${fry.style}`.toLowerCase();
      return (!query || searchable.includes(query)) && (restaurantFilter === 'all' || fry.restaurant === restaurantFilter) && (styleFilter === 'all' || fry.style === styleFilter);
    });
    return filtered.sort((a, b) => {
      if (sort === 'highest-rated') return (b.score ?? -1) - (a.score ?? -1) || b.reviewCount - a.reviewCount;
      if (sort === 'newest') return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      if (sort === 'most-reviewed') return b.reviewCount - a.reviewCount || (b.score ?? -1) - (a.score ?? -1);
      return 0;
    });
  }, [browseFries, restaurantFilter, search, sort, styleFilter]);

  function clearFilters() {
    setSearch('');
    setRestaurantFilter('all');
    setStyleFilter('all');
    setSort('default');
  }

  return (
    <main>
      <nav className="site-nav" aria-label="Main navigation">
        <a className="brand" href="/">
          <span className="brand-mark">F</span>
          <span>FryRank</span>
        </a>
        <button className="nav-toggle" type="button" aria-expanded={menuOpen} aria-controls="site-menu" onClick={() => setMenuOpen((open) => !open)}><span className="sr-only">{menuOpen ? 'Close' : 'Open'} navigation menu</span><span aria-hidden="true">{menuOpen ? '×' : '☰'}</span></button>
        <div className={`nav-links${menuOpen ? ' open' : ''}`} id="site-menu">
          <a href="#browse" onClick={() => setMenuOpen(false)}>Browse fries</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
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
        <div className="browse-toolbar" aria-label="Filter and sort rankings">
          <label><span>Restaurant</span><select value={restaurantFilter} onChange={(event) => setRestaurantFilter(event.target.value)}><option value="all">All restaurants</option>{restaurantOptions.map((restaurant) => <option key={restaurant} value={restaurant}>{restaurant}</option>)}</select></label>
          <label><span>Style</span><select value={styleFilter} onChange={(event) => setStyleFilter(event.target.value)}><option value="all">All styles</option>{styleOptions.map((style) => <option key={style} value={style}>{style}</option>)}</select></label>
          <label><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="default">Featured</option><option value="highest-rated">Highest rated</option><option value="newest">Newest</option><option value="most-reviewed">Most reviewed</option></select></label>
        </div>
        {loadError && <p className="browse-notice" role="status">{loadError}</p>}
        {loading ? <div className="browse-loading" aria-label="Loading fry rankings"><span /><span /><span /></div> : <div className="browse-result-count">Showing {visibleFries.length} of {browseFries.length} fries <span>· {dataSource === 'supabase' ? 'Live community data' : 'Saved list'}</span></div>}
        <div className="fry-grid">
          {!loading && visibleFries.map((fry) => (
            <article className="fry-card" key={fry.id || fry.name}>
              <div className={`fry-card-image ${fry.color}`}>
                <FallbackImage className="fry-card-photo" src={fry.imageUrl} alt={`${fry.restaurant} ${fry.name}`} />
                <span className="score-badge">★ {fry.score ? fry.score.toFixed(1) : '—'}</span>
              </div>
              <div className="fry-card-content">
                <p className="card-kicker">Fast-food restaurant</p>
                <h3>{fry.restaurant}</h3>
                <p className="card-restaurant">{fry.name}</p>
                <p className="card-reviews">{fry.reviewCount ? `${fry.reviewCount} ${fry.reviewCount === 1 ? 'review' : 'reviews'}` : 'No community reviews yet'}</p>
                <a className="text-button" href={`/fries/${fry.restaurantSlug || fry.slug || getRestaurantSlug(fry.restaurant)}`}>View details <span aria-hidden="true">→</span></a>
              </div>
            </article>
          ))}
        </div>
        {!loading && visibleFries.length === 0 && <div className="empty-state"><strong>No fries match those filters.</strong><span>Try a different restaurant, style, or search term.</span><button className="text-button" type="button" onClick={clearFilters}>Clear filters</button></div>}
      </section>

      <footer className="site-footer">
        <span>FryRank</span>
        <span>Built for fry people, by fry people.</span>
      </footer>
    </main>
  );
}
