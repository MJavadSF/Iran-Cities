import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CityCombobox, ProvinceCitySelect } from '../src/react-components';
import * as lite from '../src/lite-react-components';
import type { FlatCity, ProvinceCityValue } from '../src/types';

afterEach(cleanup);

async function expectAccessible(container: HTMLElement): Promise<void> {
  const result = await axe.run(container, { rules: { region: { enabled: false } } });
  expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

describe('CityCombobox', () => {
  it('follows the ARIA combobox pattern', async () => {
    const user = userEvent.setup();
    const { container } = render(<CityCombobox label="شهر" />);
    const input = screen.getByRole('combobox', { name: 'شهر' });
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
    await user.type(input, 'شیر');
    expect(input.getAttribute('aria-expanded')).toBe('true');
    const listbox = screen.getByRole('listbox');
    expect(input.getAttribute('aria-controls')).toBe(listbox.id);
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
    await expectAccessible(container);
  });

  it('selects with the keyboard', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(city: FlatCity | null) => void>();
    render(<CityCombobox label="شهر" onChange={onChange} />);
    const input = screen.getByRole('combobox');
    await user.type(input, 'شیراز');
    await user.keyboard('{ArrowDown}');
    const active = input.getAttribute('aria-activedescendant');
    expect(active).toBeTruthy();
    expect(document.getElementById(active as string)?.textContent).toContain('شیراز');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: 292 }));
    expect((input as HTMLInputElement).value).toBe('شیراز');
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('wraps around with arrow keys and supports Home and End', async () => {
    const user = userEvent.setup();
    render(<CityCombobox label="شهر" province="qom" limit={3} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{ArrowUp}');
    const options = screen.getAllByRole('option');
    expect(input.getAttribute('aria-activedescendant')).toBe(options[options.length - 1]?.id);
    await user.keyboard('{Home}');
    expect(input.getAttribute('aria-activedescendant')).toBe(options[0]?.id);
    await user.keyboard('{End}');
    expect(input.getAttribute('aria-activedescendant')).toBe(options[options.length - 1]?.id);
  });

  it('selects with the mouse and restores text on blur', async () => {
    const user = userEvent.setup();
    render(
      <>
        <CityCombobox label="شهر" defaultValue={292} />
        <button type="button">other</button>
      </>,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toBe('شیراز');
    await user.clear(input);
    await user.type(input, 'اصفهان');
    await user.click(screen.getAllByRole('option')[0] as HTMLElement);
    expect(input.value).toBe('اصفهان');
    await user.clear(input);
    await user.type(input, 'xyz');
    await user.click(screen.getByRole('button', { name: 'other' }));
    expect(input.value).toBe('اصفهان');
  });

  it('closes with Escape, then clears with a second Escape', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CityCombobox label="شهر" defaultValue={292} onChange={onChange} />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await user.click(input);
    await user.type(input, 'x');
    await user.keyboard('{Escape}');
    expect(input.value).toBe('شیراز');
    await user.keyboard('{Escape}');
    expect(input.value).toBe('');
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('limits results to a province and shows the empty state', async () => {
    const user = userEvent.setup();
    render(<CityCombobox label="شهر" province="qom" noResultsText="هیچ" />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    expect(screen.getAllByRole('option').every((o) => !o.textContent?.includes('تهران'))).toBe(true);
    await user.type(input, 'شیراز');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByText('هیچ')).toBeTruthy();
  });

  it('fixes the keyboard layout while typing', async () => {
    const user = userEvent.setup();
    render(<CityCombobox label="شهر" />);
    await user.type(screen.getByRole('combobox'), 'jivhk');
    expect(screen.getAllByRole('option')[0]?.textContent).toContain('تهران');
  });

  it('submits the city id through a hidden input', () => {
    const { container } = render(
      <form>
        <CityCombobox label="شهر" name="cityId" defaultValue={292} />
      </form>,
    );
    const form = container.querySelector('form') as HTMLFormElement;
    expect(new FormData(form).get('cityId')).toBe('292');
  });

  it('works controlled and in English', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = React.useState<number | null>(1126);
      return <CityCombobox label="City" locale="en" dir="ltr" value={value} onChange={(c) => setValue(c ? c.id : null)} />;
    }
    render(<Controlled />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toBe('Tehran');
    await user.clear(input);
    await user.type(input, 'shiraz');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(input.value).toBe('Shiraz');
  });
});

describe('ProvinceCitySelect', () => {
  it('renders labelled native selects and resets the city', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: ProvinceCityValue) => void>();
    const { container } = render(<ProvinceCitySelect onChange={onChange} />);
    const province = screen.getByRole('combobox', { name: 'استان' }) as HTMLSelectElement;
    const city = screen.getByRole('combobox', { name: 'شهر' }) as HTMLSelectElement;
    expect(city.disabled).toBe(true);
    await user.selectOptions(province, '7');
    expect(onChange).toHaveBeenLastCalledWith({ provinceId: 7, cityId: undefined });
    expect(city.disabled).toBe(false);
    await user.selectOptions(city, '292');
    expect(onChange).toHaveBeenLastCalledWith({ provinceId: 7, cityId: 292 });
    await user.selectOptions(province, '28');
    expect(city.value).toBe('');
    await expectAccessible(container);
  });

  it('submits ids with names and accepts defaults', () => {
    const { container } = render(
      <form>
        <ProvinceCitySelect provinceName="provinceId" cityName="cityId" defaultValue={{ cityId: 292 }} />
      </form>,
    );
    const data = new FormData(container.querySelector('form') as HTMLFormElement);
    expect(data.get('provinceId')).toBe('7');
    expect(data.get('cityId')).toBe('292');
  });

  it('sorts options alphabetically and supports English', () => {
    render(<ProvinceCitySelect locale="en" dir="ltr" provinceLabel="Province" cityLabel="City" />);
    const options = [...(screen.getByRole('combobox', { name: 'Province' }) as HTMLSelectElement).options].slice(1);
    const names = options.map((o) => o.textContent ?? '');
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'en')));
    expect(names).toContain('Kohgiluyeh and Boyer-Ahmad');
  });

  it('is exported from the lite entry too', () => {
    render(<lite.ProvinceCitySelect defaultValue={{ provinceId: 23 }} />);
    expect((screen.getByRole('combobox', { name: 'استان' }) as HTMLSelectElement).value).toBe('23');
    act(() => {
      fireEvent.change(screen.getByRole('combobox', { name: 'شهر' }), { target: { value: '' } });
    });
  });
});
