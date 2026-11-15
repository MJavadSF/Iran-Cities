export type CityId = number;

export type ProvinceId = number;

export type CityKey = string;

export type Query = string | number;

export type Locale = 'en' | 'fa';

export type CoordinateConfidence = 'high' | 'medium' | 'low';

export interface LatLng {
  readonly lat: number;
  readonly lng: number;
}

export interface Coordinates extends LatLng {
  readonly confidence: CoordinateConfidence;
}

export interface City {
  readonly id: CityId;
  readonly isCapital: boolean;
  readonly coordinates?: Coordinates;
  readonly slug: CityKey;
  readonly en: string;
  readonly fa: string;
  readonly nameEn: string;
  readonly aliases: readonly string[];
}

export interface Province {
  readonly id: ProvinceId;
  readonly en: string;
  readonly fa: string;
  readonly nameEn: string;
  readonly phoneCode: string;
  readonly capitalId: CityId;
  readonly neighborIds: readonly ProvinceId[];
  readonly cities: readonly City[];
}

export interface ProvinceListItem {
  id: ProvinceId;
  en: string;
  fa: string;
  nameEn: string;
  phoneCode: string;
  capitalId: CityId;
}

export interface FlatCity extends City {
  readonly provinceId: ProvinceId;
  readonly provinceEn: string;
  readonly provinceFa: string;
  readonly provinceNameEn: string;
  readonly phoneCode: string;
}

export interface SearchOptions {
  limit?: number;
  locale?: Locale | 'both';
  fuzzy?: boolean;
  maxDistance?: number;
  emptyQuery?: 'all' | 'none';
  keyboardFix?: boolean;
}

export interface NearestCitiesOptions {
  limit?: number;
  minConfidence?: CoordinateConfidence;
  maxDistanceKm?: number;
}

export interface NearestCity {
  readonly city: FlatCity;
  readonly distanceKm: number;
}

export type DataChangeType = 'renamed' | 'spelling' | 'removed' | 'coordinates';

export interface DataChange {
  readonly version: string;
  readonly type: DataChangeType;
  readonly cityId?: CityId;
  readonly provinceId?: ProvinceId;
  readonly before?: { readonly en?: string; readonly fa?: string; readonly slug?: CityKey };
  readonly after?: { readonly en?: string; readonly fa?: string; readonly slug?: CityKey };
  readonly note: string;
}

export interface Stats {
  readonly provinceCount: number;
  readonly cityCount: number;
}

export interface IranCities {
  getProvinces(): readonly Province[];
  getProvincesList(): ProvinceListItem[];
  getProvinceById(id: ProvinceId): Province | undefined;
  getProvince(query: Query): Province | undefined;
  getCities(provinceQuery: Query): readonly City[];
  getAllCities(): readonly FlatCity[];
  getCityById(id: CityId): FlatCity | undefined;
  getCityBySlug(slug: CityKey): FlatCity | undefined;
  getCity(cityQuery: Query, provinceQuery?: Query): FlatCity | undefined;
  getCitiesByName(cityQuery: string): readonly FlatCity[];
  isAmbiguousCityName(cityQuery: string): boolean;
  getProvinceOfCity(cityQuery: Query): Province | undefined;
  getCapital(provinceQuery: Query): FlatCity | undefined;
  getCapitals(): FlatCity[];
  getProvinceByPhoneCode(code: string | number): Province | undefined;
  searchProvinces(query: string, options?: SearchOptions): Province[];
  searchCities(query: string, options?: SearchOptions): FlatCity[];
  getNeighborProvinces(provinceQuery: Query): Province[];
  areNeighborProvinces(a: Query, b: Query): boolean;
  getStats(): Stats;
}

export interface IranCitiesGeo {
  getDistance(from: LatLng | Query, to: LatLng | Query): number | undefined;
  getNearestCities(point: LatLng | Query, options?: NearestCitiesOptions): NearestCity[];
}

export interface ProvinceCityValue {
  provinceId?: ProvinceId;
  cityId?: CityId;
}

export interface ProvinceCitySelectOptions {
  initialProvince?: Query;
  initialCity?: Query;
  value?: ProvinceCityValue;
  onChange?: (value: ProvinceCityValue) => void;
}

export interface ProvinceCitySelect {
  provinces: ProvinceListItem[];
  cities: readonly City[];
  province: string;
  city: string;
  provinceId: ProvinceId | undefined;
  cityId: CityId | undefined;
  value: ProvinceCityValue;
  selectedProvince: Province | undefined;
  selectedCity: FlatCity | undefined;
  setProvince: (value: Query) => void;
  setCity: (value: Query) => void;
  reset: () => void;
}

export interface SearchState<T> {
  query: string;
  setQuery: (query: string | ((previous: string) => string)) => void;
  results: T[];
}

export interface IranCitiesHooks {
  useProvinces(): ProvinceListItem[];
  useCities(provinceQuery: Query | undefined | null): readonly City[];
  useProvinceCitySelect(options?: ProvinceCitySelectOptions): ProvinceCitySelect;
  useCitySearch(initialQuery?: string, options?: SearchOptions): SearchState<FlatCity>;
  useProvinceSearch(initialQuery?: string, options?: SearchOptions): SearchState<Province>;
}
