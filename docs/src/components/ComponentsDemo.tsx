import { useState } from 'react';
import { CityCombobox, ProvinceCitySelect } from '@code-plate/iran-cities/lite/react/components';
import type { FlatCity, ProvinceCityValue } from '@code-plate/iran-cities/lite/react/components';
import '@code-plate/iran-cities/components.css';

interface Props {
  lang?: 'en' | 'fa';
}

export default function ComponentsDemo({ lang = 'en' }: Props) {
  const fa = lang === 'fa';
  const [city, setCity] = useState<FlatCity | null>(null);
  const [value, setValue] = useState<ProvinceCityValue>({ provinceId: 7, cityId: 292 });

  return (
    <div className="demo not-content" dir={fa ? 'rtl' : 'ltr'}>
      <ProvinceCitySelect
        value={value}
        onChange={setValue}
        locale={fa ? 'fa' : 'en'}
        dir={fa ? 'rtl' : 'ltr'}
        provinceLabel={fa ? 'استان' : 'Province'}
        cityLabel={fa ? 'شهر' : 'City'}
        provincePlaceholder={fa ? 'انتخاب استان' : 'Choose a province'}
        cityPlaceholder={fa ? 'انتخاب شهر' : 'Choose a city'}
      />
      <div style={{ marginBlockStart: '1rem' }}>
        <CityCombobox
          label={fa ? 'جستجوی شهر' : 'Search a city'}
          placeholder={fa ? 'مثلاً شیراز، یا jivhk' : 'e.g. shiraz, or jivhk'}
          locale={fa ? 'fa' : 'en'}
          dir={fa ? 'rtl' : 'ltr'}
          noResultsText={fa ? 'شهری پیدا نشد' : 'No city found'}
          onChange={setCity}
        />
      </div>
      <pre className="demo-output" dir="ltr">
        {JSON.stringify(
          { selectValue: value, combobox: city ? { id: city.id, fa: city.fa, nameEn: city.nameEn, province: city.provinceFa } : null },
          null,
          2,
        )}
      </pre>
    </div>
  );
}
