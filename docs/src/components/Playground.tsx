import { useMemo, useState } from 'react';
import {
  areNeighborProvinces,
  convertKeyboardLayout,
  getCity,
  getDistance,
  getNeighborProvinces,
  getProvincesList,
  searchCities,
} from '@code-plate/iran-cities';

interface Props {
  lang?: 'en' | 'fa';
}

const TEXT = {
  en: {
    search: 'Search',
    searchHint: 'Try تهرن, ابادان, jivhk (Tehran typed on an English keyboard) or bandar',
    fuzzy: 'Typo tolerant (fuzzy)',
    province: 'Province',
    neighbors: 'Neighbors',
    distance: 'Distance',
    from: 'From',
    to: 'To',
    km: 'km',
    noCoordinates: 'One of the cities has no coordinates',
    keyboard: 'Keyboard layout fix',
    results: 'results',
    adjacent: 'share a border',
    notAdjacent: 'do not share a border',
  },
  fa: {
    search: 'جستجو',
    searchHint: 'امتحان کنید: تهرن، ابادان، jivhk (تهران با کیبورد انگلیسی) یا بندر',
    fuzzy: 'تحمل غلط تایپی (fuzzy)',
    province: 'استان',
    neighbors: 'همسایه‌ها',
    distance: 'فاصله',
    from: 'از',
    to: 'تا',
    km: 'کیلومتر',
    noCoordinates: 'یکی از شهرها مختصات ندارد',
    keyboard: 'تصحیح کیبورد',
    results: 'نتیجه',
    adjacent: 'هم‌مرز هستند',
    notAdjacent: 'هم‌مرز نیستند',
  },
};

export default function Playground({ lang = 'en' }: Props) {
  const t = TEXT[lang];
  const fa = lang === 'fa';
  const [query, setQuery] = useState('تهرن');
  const [fuzzy, setFuzzy] = useState(true);
  const [provinceId, setProvinceId] = useState(23);
  const [from, setFrom] = useState('tehran');
  const [to, setTo] = useState('shiraz');
  const [other, setOther] = useState(28);

  const provinces = useMemo(
    () => getProvincesList().sort((a, b) => (fa ? a.fa.localeCompare(b.fa, 'fa') : a.nameEn.localeCompare(b.nameEn))),
    [fa],
  );
  const results = useMemo(() => searchCities(query, { fuzzy, limit: 8, emptyQuery: 'none' }), [query, fuzzy]);
  const neighbors = getNeighborProvinces(provinceId);
  const distance = getDistance(from, to);
  const fromCity = getCity(from);
  const toCity = getCity(to);
  const name = (p: { fa: string; nameEn: string }) => (fa ? p.fa : p.nameEn);

  return (
    <div className="playground-grid" dir={fa ? 'rtl' : 'ltr'}>
      <section className="demo not-content">
        <h3>{t.search}</h3>
        <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label={t.search} />
        <p>
          <small>{t.searchHint}</small>
        </p>
        <label>
          <input type="checkbox" checked={fuzzy} onChange={(e) => setFuzzy(e.target.checked)} style={{ inlineSize: 'auto' }} /> {t.fuzzy}
        </label>
        <p>
          <small>
            {t.keyboard}: <code>{convertKeyboardLayout(query, /[a-z]/i.test(query) ? 'fa' : 'en')}</code> · {results.length} {t.results}
          </small>
        </p>
        <ul className="result-list">
          {results.map((c) => (
            <li key={c.id}>
              <span>{name(c)}</span>
              <small>
                {fa ? c.provinceFa : c.provinceNameEn} · #{c.id}
              </small>
            </li>
          ))}
        </ul>
      </section>

      <section className="demo not-content">
        <h3>{t.neighbors}</h3>
        <select value={provinceId} onChange={(e) => setProvinceId(Number(e.target.value))} aria-label={t.province}>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>
              {name(p)}
            </option>
          ))}
        </select>
        <p>{neighbors.map(name).join(fa ? '، ' : ', ')}</p>
        <select value={other} onChange={(e) => setOther(Number(e.target.value))} aria-label={t.province}>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>
              {name(p)}
            </option>
          ))}
        </select>
        <p>
          <code>areNeighborProvinces({provinceId}, {other})</code> → {String(areNeighborProvinces(provinceId, other))} (
          {areNeighborProvinces(provinceId, other) ? t.adjacent : t.notAdjacent})
        </p>
      </section>

      <section className="demo not-content">
        <h3>{t.distance}</h3>
        <input value={from} onChange={(e) => setFrom(e.target.value)} aria-label={t.from} />
        <input value={to} onChange={(e) => setTo(e.target.value)} aria-label={t.to} style={{ marginBlockStart: '0.5rem' }} />
        <p>
          {fromCity ? name(fromCity) : '?'} → {toCity ? name(toCity) : '?'}:{' '}
          <strong>{distance === undefined ? t.noCoordinates : `${distance.toFixed(1)} ${t.km}`}</strong>
        </p>
      </section>
    </div>
  );
}
