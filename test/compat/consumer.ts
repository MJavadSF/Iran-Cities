import { convertKeyboardLayout, getCities, getCity, getDataChanges, getNearestCities, getNeighborProvinces, searchCities } from '@code-plate/iran-cities';
import type { City, DataChange, FlatCity, KeyboardTarget, Province } from '@code-plate/iran-cities';
import * as lite from '@code-plate/iran-cities/lite';
import { getProvinceAt, provinceBoundaries } from '@code-plate/iran-cities/boundaries';
import type { ProvinceFeature } from '@code-plate/iran-cities/boundaries';

const cities: ReadonlyArray<City> = getCities('fars');
const copy: City[] = cities.slice();
const city: FlatCity | undefined = getCity('shiraz', 'fars');
const nearest = getNearestCities({ lat: 29.6, lng: 52.5 }, { limit: 1 });
const results: FlatCity[] = searchCities('شیر', { limit: 5, fuzzy: true, keyboardFix: true });
const provinces: ReadonlyArray<Province> = lite.getProvinces();
const neighbors: Province[] = getNeighborProvinces('qom');
const target: KeyboardTarget = 'fa';
const converted: string = convertKeyboardLayout('jivhk', target);
const changes: DataChange[] = getDataChanges('1.2.0');
const at: Province | undefined = getProvinceAt({ lat: 34.64, lng: 50.88 });
const feature: ProvinceFeature | undefined = provinceBoundaries.features[0];
const name: string = city ? city.nameEn + city.provinceNameEn : '';

export const values = [copy, city, nearest, results, provinces, neighbors, converted, changes, at, feature, name];
