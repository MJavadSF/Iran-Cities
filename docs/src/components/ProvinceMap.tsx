import { useEffect, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAllCities, getCapital, getNeighborProvinces, getProvinceById } from '@code-plate/iran-cities';
import { getProvinceAt, provinceBoundaries } from '@code-plate/iran-cities/boundaries';

interface Props {
  lang?: 'en' | 'fa';
}

const CONFIDENCE_COLOR = { high: '#0a7f5a', medium: '#d97706', low: '#dc2626' } as const;

const TEXT = {
  en: {
    capital: 'Capital',
    areaCode: 'Area code',
    neighbors: 'Neighbors',
    cities: 'Cities',
    hint: 'Hover a province to see its neighbors. Click anywhere to run getProvinceAt.',
    outside: 'Outside Iran',
    high: 'high',
    medium: 'medium',
    low: 'low',
  },
  fa: {
    capital: 'مرکز',
    areaCode: 'کد تلفن',
    neighbors: 'همسایه‌ها',
    cities: 'شهرها',
    hint: 'نشانگر را روی یک استان ببرید تا همسایه‌هایش را ببینید. برای اجرای getProvinceAt روی نقشه کلیک کنید.',
    outside: 'خارج از ایران',
    high: 'دقیق',
    medium: 'متوسط',
    low: 'تقریبی',
  },
};

export default function ProvinceMap({ lang = 'en' }: Props) {
  const fa = lang === 'fa';
  const t = TEXT[lang];
  const container = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string>('');

  useEffect(() => {
    if (!container.current) return;
    let map: Leaflet.Map | undefined;
    let cancelled = false;
    import('leaflet').then(({ default: L }) => {
      if (cancelled || !container.current) return;
      map = draw(L, container.current);
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [fa, t]);

  function draw(L: typeof Leaflet, element: HTMLDivElement): Leaflet.Map {
    const map = L.map(element, { scrollWheelZoom: false, preferCanvas: true }).setView([32.5, 54], 5);
    map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 12,
      attribution: '&copy; OpenStreetMap contributors · Boundaries: geoBoundaries (ODbL)',
    }).addTo(map);

    const layers = new Map<number, Leaflet.Path>();
    const baseStyle: Leaflet.PathOptions = { color: '#0a7f5a', weight: 1, fillColor: '#0a7f5a', fillOpacity: 0.08 };

    const provinces = L.geoJSON(provinceBoundaries as unknown as GeoJSON.FeatureCollection, {
      style: () => baseStyle,
      onEachFeature: (feature, layer) => {
        const id = (feature.properties as { id: number }).id;
        layers.set(id, layer as Leaflet.Path);
        layer.on('mouseover', () => {
          const province = getProvinceById(id);
          if (!province) return;
          (layer as Leaflet.Path).setStyle({ fillOpacity: 0.35, weight: 2 });
          for (const n of getNeighborProvinces(id)) layers.get(n.id)?.setStyle({ fillColor: '#d97706', fillOpacity: 0.25 });
          setHovered(
            `${fa ? province.fa : province.nameEn} · ${t.neighbors}: ${getNeighborProvinces(id)
              .map((n) => (fa ? n.fa : n.nameEn))
              .join(fa ? '، ' : ', ')}`,
          );
        });
        layer.on('mouseout', () => {
          for (const path of layers.values()) path.setStyle(baseStyle);
          setHovered('');
        });
      },
    }).addTo(map);

    const cities = L.layerGroup(
      getAllCities()
        .filter((c) => c.coordinates)
        .map((c) =>
          L.circleMarker([c.coordinates!.lat, c.coordinates!.lng], {
            radius: c.isCapital ? 5 : 3,
            color: CONFIDENCE_COLOR[c.coordinates!.confidence],
            weight: 1,
            fillOpacity: 0.9,
          }).bindTooltip(`${fa ? c.fa : c.nameEn} (${t[c.coordinates!.confidence]})`),
        ),
    ).addTo(map);

    L.control.layers(undefined, { [t.cities]: cities }, { collapsed: false }).addTo(map);

    map.on('click', (event: Leaflet.LeafletMouseEvent) => {
      const province = getProvinceAt({ lat: event.latlng.lat, lng: event.latlng.lng });
      const html = province
        ? `<strong>${fa ? province.fa : province.nameEn}</strong><br>${t.capital}: ${
            fa ? getCapital(province.id)?.fa : getCapital(province.id)?.nameEn
          }<br>${t.areaCode}: ${province.phoneCode}<br><code>getProvinceAt({ lat: ${event.latlng.lat.toFixed(3)}, lng: ${event.latlng.lng.toFixed(3)} })</code>`
        : t.outside;
      L.popup().setLatLng(event.latlng).setContent(`<div dir="${fa ? 'rtl' : 'ltr'}">${html}</div>`).openOn(map);
    });

    map.fitBounds(provinces.getBounds());
    return map;
  }

  return (
    <div className="not-content">
      <p dir={fa ? 'rtl' : 'ltr'} style={{ minBlockSize: '3.25em', marginBlockEnd: '0.5rem' }}>
        <small>{hovered || t.hint}</small>
      </p>
      <div ref={container} className="map" dir="ltr" />
    </div>
  );
}
