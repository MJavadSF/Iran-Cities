import * as React from 'react';
import type {
  CityId,
  FlatCity,
  IranCities,
  IranCitiesHooks,
  ProvinceCityValue,
  ProvinceId,
  Query,
} from './types';

export interface CityComboboxProps {
  value?: CityId | null;
  defaultValue?: CityId | null;
  onChange?: (city: FlatCity | null) => void;
  province?: Query | null;
  label?: React.ReactNode;
  placeholder?: string;
  noResultsText?: React.ReactNode;
  limit?: number;
  fuzzy?: boolean;
  showProvince?: boolean;
  locale?: 'fa' | 'en';
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  dir?: 'rtl' | 'ltr' | 'auto';
  className?: string;
  inputProps?: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'>;
}

export interface ProvinceCitySelectProps {
  value?: ProvinceCityValue;
  defaultValue?: ProvinceCityValue;
  onChange?: (value: ProvinceCityValue) => void;
  provinceLabel?: React.ReactNode;
  cityLabel?: React.ReactNode;
  provincePlaceholder?: string;
  cityPlaceholder?: string;
  provinceName?: string;
  cityName?: string;
  locale?: 'fa' | 'en';
  id?: string;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  layout?: 'row' | 'column';
  dir?: 'rtl' | 'ltr' | 'auto';
  className?: string;
}

export interface IranCitiesComponents {
  CityCombobox: (props: CityComboboxProps) => React.ReactElement;
  ProvinceCitySelect: (props: ProvinceCitySelectProps) => React.ReactElement;
}

let idCounter = 0;

function useStableId(explicit: string | undefined): string {
  const reactUseId = (React as unknown as { useId?: () => string }).useId;
  const generated = reactUseId ? reactUseId() : undefined;
  const [fallback] = React.useState(() => `ic-${++idCounter}`);
  return explicit ?? (generated ? `ic-${generated.replace(/:/g, '')}` : fallback);
}

function classNames(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

export function createComponents(api: IranCities, hooks: IranCitiesHooks): IranCitiesComponents {
  function displayName(city: FlatCity, locale: 'fa' | 'en'): string {
    return locale === 'en' ? city.nameEn : city.fa;
  }

  function CityCombobox(props: CityComboboxProps): React.ReactElement {
    const {
      value,
      defaultValue = null,
      onChange,
      province,
      label,
      placeholder,
      noResultsText = 'شهری پیدا نشد',
      limit = 8,
      fuzzy = true,
      showProvince,
      locale = 'fa',
      name,
      id,
      required,
      disabled,
      invalid,
      dir = 'rtl',
      className,
      inputProps,
    } = props;

    const baseId = useStableId(id);
    const inputId = `${baseId}-input`;
    const listId = `${baseId}-list`;
    const labelId = `${baseId}-label`;

    const controlled = value !== undefined;
    const [innerId, setInnerId] = React.useState<CityId | null>(defaultValue);
    const selectedId = controlled ? value ?? null : innerId;
    const selected = selectedId === null ? undefined : api.getCityById(selectedId);

    const scope = province === undefined || province === null || province === '' ? undefined : api.getProvince(province);
    const scopeId: ProvinceId | undefined = scope?.id;

    const [text, setText] = React.useState(() => (selected ? displayName(selected, locale) : ''));
    const [open, setOpen] = React.useState(false);
    const [active, setActive] = React.useState(-1);
    const listRef = React.useRef<HTMLUListElement>(null);

    React.useEffect(() => {
      setText(selected ? displayName(selected, locale) : '');
    }, [selected, locale]);

    const results = React.useMemo(() => {
      const found = api.searchCities(text, {
        fuzzy,
        emptyQuery: scopeId === undefined ? 'none' : 'all',
        limit: scopeId === undefined ? limit : undefined,
      });
      const scoped = scopeId === undefined ? found : found.filter((c) => c.provinceId === scopeId);
      return scoped.slice(0, limit);
    }, [text, fuzzy, limit, scopeId]);

    const withProvince = showProvince ?? scopeId === undefined;

    function select(city: FlatCity | null): void {
      if (!controlled) setInnerId(city ? city.id : null);
      setText(city ? displayName(city, locale) : '');
      setOpen(false);
      setActive(-1);
      onChange?.(city);
    }

    function restore(): void {
      setText(selected ? displayName(selected, locale) : '');
      setOpen(false);
      setActive(-1);
    }

    React.useEffect(() => {
      if (active < 0 || !listRef.current) return;
      const option = listRef.current.children[active] as HTMLElement | undefined;
      if (option && typeof option.scrollIntoView === 'function') option.scrollIntoView({ block: 'nearest' });
    }, [active]);

    function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
      inputProps?.onKeyDown?.(event);
      if (event.defaultPrevented) return;
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (!open) setOpen(true);
          setActive((i) => (results.length === 0 ? -1 : (i + 1) % results.length));
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (!open) setOpen(true);
          setActive((i) => (results.length === 0 ? -1 : i <= 0 ? results.length - 1 : i - 1));
          break;
        case 'Home':
          if (open && results.length > 0) {
            event.preventDefault();
            setActive(0);
          }
          break;
        case 'End':
          if (open && results.length > 0) {
            event.preventDefault();
            setActive(results.length - 1);
          }
          break;
        case 'Enter':
          if (open && active >= 0 && results[active]) {
            event.preventDefault();
            select(results[active] as FlatCity);
          }
          break;
        case 'Escape':
          if (open) {
            event.preventDefault();
            restore();
          } else if (text) {
            event.preventDefault();
            select(null);
          }
          break;
        case 'Tab':
          if (open) restore();
          break;
        default:
          break;
      }
    }

    const expanded = open && !disabled;
    const activeId = expanded && active >= 0 ? `${baseId}-option-${active}` : undefined;

    return (
      <div
        className={classNames('ic-field', 'ic-combobox', className)}
        dir={dir}
        data-open={expanded ? '' : undefined}
        data-invalid={invalid ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
      >
        {label !== undefined ? (
          <label className="ic-label" id={labelId} htmlFor={inputId}>
            {label}
          </label>
        ) : null}
        <div className="ic-control">
          <input
            {...inputProps}
            id={inputId}
            className={classNames('ic-input', inputProps?.className)}
            type="text"
            role="combobox"
            autoComplete="off"
            spellCheck={false}
            aria-autocomplete="list"
            aria-expanded={expanded}
            aria-controls={listId}
            aria-activedescendant={activeId}
            aria-invalid={invalid || undefined}
            aria-required={required || undefined}
            placeholder={placeholder}
            disabled={disabled}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={(event) => {
              inputProps?.onFocus?.(event);
              if (scopeId !== undefined || text) setOpen(true);
            }}
            onBlur={(event) => {
              inputProps?.onBlur?.(event);
              restore();
            }}
            onKeyDown={onKeyDown}
          />
          {name ? <input type="hidden" name={name} value={selected ? String(selected.id) : ''} /> : null}
        </div>
        <ul
          ref={listRef}
          id={listId}
          className="ic-listbox"
          role="listbox"
          aria-labelledby={label !== undefined ? labelId : undefined}
          hidden={!expanded}
        >
          {expanded && results.length === 0 ? (
            <li className="ic-empty" role="presentation">
              {noResultsText}
            </li>
          ) : null}
          {expanded
            ? results.map((city, index) => (
                <li
                  key={city.id}
                  id={`${baseId}-option-${index}`}
                  className="ic-option"
                  role="option"
                  aria-selected={selected?.id === city.id}
                  data-active={index === active ? '' : undefined}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseMove={() => setActive(index)}
                  onClick={() => select(city)}
                >
                  <span className="ic-option-name">{displayName(city, locale)}</span>
                  {withProvince ? (
                    <span className="ic-option-meta">{locale === 'en' ? city.provinceNameEn : city.provinceFa}</span>
                  ) : null}
                </li>
              ))
            : null}
        </ul>
      </div>
    );
  }

  function ProvinceCitySelect(props: ProvinceCitySelectProps): React.ReactElement {
    const {
      value,
      defaultValue,
      onChange,
      provinceLabel = 'استان',
      cityLabel = 'شهر',
      provincePlaceholder = 'انتخاب استان',
      cityPlaceholder = 'انتخاب شهر',
      provinceName,
      cityName,
      locale = 'fa',
      id,
      required,
      disabled,
      invalid,
      layout = 'row',
      dir = 'rtl',
      className,
    } = props;

    const baseId = useStableId(id);
    const state = hooks.useProvinceCitySelect({
      value,
      onChange,
      initialProvince: defaultValue?.provinceId,
      initialCity: defaultValue?.cityId,
    });
    const provinceList = state.provinces;
    const sortedProvinces = React.useMemo(
      () =>
        locale === 'en'
          ? provinceList.slice().sort((a, b) => a.nameEn.localeCompare(b.nameEn, 'en'))
          : provinceList.slice().sort((a, b) => a.fa.localeCompare(b.fa, 'fa')),
      [provinceList, locale],
    );
    const sortedCities = React.useMemo(
      () =>
        locale === 'en'
          ? state.cities.slice().sort((a, b) => a.nameEn.localeCompare(b.nameEn, 'en'))
          : state.cities.slice().sort((a, b) => a.fa.localeCompare(b.fa, 'fa')),
      [state.cities, locale],
    );

    return (
      <div
        className={classNames('ic-group', className)}
        dir={dir}
        data-layout={layout}
        data-invalid={invalid ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
      >
        <div className="ic-field">
          <label className="ic-label" htmlFor={`${baseId}-province`}>
            {provinceLabel}
          </label>
          <select
            id={`${baseId}-province`}
            className="ic-select"
            name={provinceName}
            value={state.provinceId === undefined ? '' : String(state.provinceId)}
            required={required}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            onChange={(event) => state.setProvince(event.target.value === '' ? '' : Number(event.target.value))}
          >
            <option value="">{provincePlaceholder}</option>
            {sortedProvinces.map((p) => (
              <option key={p.id} value={p.id}>
                {locale === 'en' ? p.nameEn : p.fa}
              </option>
            ))}
          </select>
        </div>
        <div className="ic-field">
          <label className="ic-label" htmlFor={`${baseId}-city`}>
            {cityLabel}
          </label>
          <select
            id={`${baseId}-city`}
            className="ic-select"
            name={cityName}
            value={state.cityId === undefined ? '' : String(state.cityId)}
            required={required}
            disabled={disabled || state.provinceId === undefined}
            aria-invalid={invalid || undefined}
            onChange={(event) => state.setCity(event.target.value === '' ? '' : Number(event.target.value))}
          >
            <option value="">{cityPlaceholder}</option>
            {sortedCities.map((c) => (
              <option key={c.id} value={c.id}>
                {locale === 'en' ? c.nameEn : c.fa}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return { CityCombobox, ProvinceCitySelect };
}
