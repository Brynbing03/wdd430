'use client';

import { useState } from 'react';

export default function FallbackImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return <div className={`${className} image-fallback`} role="img" aria-label={`${alt} image unavailable`}><span aria-hidden="true">🍟</span><small>Image unavailable</small></div>;
  }

  return <img className={className} src={src} alt={alt} onError={() => setFailed(true)} />;
}
