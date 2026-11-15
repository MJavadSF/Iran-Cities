import { getCity, getNearestCities, getNeighborProvinces, getProvincesList, getStats } from '@code-plate/iran-cities';
import { provinceCitySchema } from '@code-plate/iran-cities/zod';
import AddressForm from './address-form';
import CitySearch from './city-search';
import Components from './components';

export default function Page() {
  const shiraz = getCity('شیراز');
  const near = getNearestCities('tehran', { limit: 2 }).map((n) => n.city.fa).join('،');
  const valid = provinceCitySchema.safeParse({ provinceId: 7, cityId: 292 }).success;
  return (
    <main>
      <p id="server">server:{getStats().cityCount}:{shiraz?.provinceFa}:{getProvincesList().length}:{near}</p>
      <p id="neighbors">neighbors:{getNeighborProvinces('قم').map((p) => p.fa).join('،')}</p>
      <p id="zod">zod:{valid ? 'ok' : 'fail'}</p>
      <AddressForm initialCity={shiraz?.id} />
      <CitySearch />
      <Components />
    </main>
  );
}
