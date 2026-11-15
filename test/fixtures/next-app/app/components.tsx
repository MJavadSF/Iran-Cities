'use client';

import { CityCombobox, ProvinceCitySelect } from '@code-plate/iran-cities/lite/react/components';

export default function Components() {
  return (
    <form>
      <ProvinceCitySelect provinceName="provinceId" cityName="cityId" defaultValue={{ cityId: 292 }} />
      <CityCombobox label="شهر مقصد" name="destination" defaultValue={1126} />
    </form>
  );
}
