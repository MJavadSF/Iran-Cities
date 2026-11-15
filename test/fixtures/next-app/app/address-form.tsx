'use client';
import { useProvinceCitySelect } from '@code-plate/iran-cities/lite/react';

export default function AddressForm({ initialCity }: { initialCity?: number }) {
  const { provinces, cities, province, city, setProvince, setCity, selectedCity } = useProvinceCitySelect({ initialCity });
  return (
    <div>
      <select value={province} onChange={(e) => setProvince(e.target.value)}>
        {provinces.map((p) => (<option key={p.id} value={p.en}>{p.fa}</option>))}
      </select>
      <select value={city} onChange={(e) => setCity(e.target.value)}>
        {cities.map((c) => (<option key={c.id} value={c.en}>{c.fa}</option>))}
      </select>
      <p id="client-form">form:{selectedCity?.fa}</p>
    </div>
  );
}
