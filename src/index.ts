import packed from './generated/data-full.json' with { type: 'json' };
import { createApi } from './core';
import { unpack } from './packed';
import type { PackedData } from './packed';
import { createGeo } from './geo';
import type { IranCities, IranCitiesGeo } from './types';

const api: IranCities = createApi(unpack(packed as PackedData));
const geo: IranCitiesGeo = createGeo(api);

export const getProvinces: IranCities['getProvinces'] = api.getProvinces;
export const getProvincesList: IranCities['getProvincesList'] = api.getProvincesList;
export const getProvinceById: IranCities['getProvinceById'] = api.getProvinceById;
export const getProvince: IranCities['getProvince'] = api.getProvince;
export const getCities: IranCities['getCities'] = api.getCities;
export const getAllCities: IranCities['getAllCities'] = api.getAllCities;
export const getCityById: IranCities['getCityById'] = api.getCityById;
export const getCityBySlug: IranCities['getCityBySlug'] = api.getCityBySlug;
export const getCity: IranCities['getCity'] = api.getCity;
export const getCitiesByName: IranCities['getCitiesByName'] = api.getCitiesByName;
export const isAmbiguousCityName: IranCities['isAmbiguousCityName'] = api.isAmbiguousCityName;
export const getProvinceOfCity: IranCities['getProvinceOfCity'] = api.getProvinceOfCity;
export const getCapital: IranCities['getCapital'] = api.getCapital;
export const getCapitals: IranCities['getCapitals'] = api.getCapitals;
export const getProvinceByPhoneCode: IranCities['getProvinceByPhoneCode'] = api.getProvinceByPhoneCode;
export const searchProvinces: IranCities['searchProvinces'] = api.searchProvinces;
export const searchCities: IranCities['searchCities'] = api.searchCities;
export const getNeighborProvinces: IranCities['getNeighborProvinces'] = api.getNeighborProvinces;
export const areNeighborProvinces: IranCities['areNeighborProvinces'] = api.areNeighborProvinces;
export const getStats: IranCities['getStats'] = api.getStats;
export const getDistance: IranCitiesGeo['getDistance'] = geo.getDistance;
export const getNearestCities: IranCitiesGeo['getNearestCities'] = geo.getNearestCities;

export { normalize } from './normalize';
export { convertKeyboardLayout } from './keyboard';
export type { KeyboardTarget } from './keyboard';
export { DATA_VERSION, DATA_CHANGES, getDataChanges } from './changes';

export type {
  City,
  CityId,
  CityKey,
  DataChange,
  DataChangeType,
  CoordinateConfidence,
  Coordinates,
  FlatCity,
  IranCities,
  IranCitiesGeo,
  LatLng,
  Locale,
  NearestCitiesOptions,
  NearestCity,
  Province,
  ProvinceId,
  ProvinceListItem,
  Query,
  SearchOptions,
  Stats,
} from './types';
