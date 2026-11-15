'use client';
import { useCitySearch } from '@code-plate/iran-cities/react';

export default function CitySearch() {
  const { query, setQuery, results } = useCitySearch('مشه', { limit: 3, emptyQuery: 'none' });
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <p id="client-search">search:{results.map((c) => c.fa).join(',')}</p>
    </div>
  );
}
