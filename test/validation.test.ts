import * as v from 'valibot';
import { describe, expect, it } from 'vitest';
import * as zodEntry from '../src/zod';
import * as valibotEntry from '../src/valibot';

describe('zod', () => {
  it('validates ids, including strings and Persian digits', () => {
    expect(zodEntry.provinceIdSchema.parse('۷')).toBe(7);
    expect(zodEntry.cityIdSchema.parse(292)).toBe(292);
    expect(zodEntry.provinceIdSchema.safeParse(99).success).toBe(false);
    expect(zodEntry.cityIdSchema.safeParse('abc').success).toBe(false);
  });

  it('resolves names to objects', () => {
    expect(zodEntry.citySchema.parse('شيراز').id).toBe(292);
    expect(zodEntry.provinceSchema.parse('fars').id).toBe(7);
    expect(zodEntry.citySchema.safeParse('nowhere').success).toBe(false);
  });

  it('checks that the city belongs to the province', () => {
    expect(zodEntry.provinceCitySchema.parse({ provinceId: '7', cityId: '292' })).toEqual({ provinceId: 7, cityId: 292 });
    const result = zodEntry.provinceCitySchema.safeParse({ provinceId: 28, cityId: 292 });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['cityId']);
    expect(result.error?.issues[0]?.message).toBe('این شهر در استان انتخاب‌شده نیست.');
  });

  it('supports custom messages', () => {
    const schemas = zodEntry.createZodSchemas({ city: 'Invalid city' });
    expect(schemas.cityId.safeParse(0).error?.issues[0]?.message).toBe('Invalid city');
  });
});

describe('valibot', () => {
  it('validates ids and names', () => {
    expect(v.parse(valibotEntry.provinceIdSchema, '۷')).toBe(7);
    expect(v.safeParse(valibotEntry.cityIdSchema, 0).success).toBe(false);
    expect(v.parse(valibotEntry.citySchema, 'shiraz').id).toBe(292);
    expect(v.parse(valibotEntry.provinceSchema, 'فارس').id).toBe(7);
  });

  it('checks that the city belongs to the province', () => {
    expect(v.parse(valibotEntry.provinceCitySchema, { provinceId: 7, cityId: 292 })).toEqual({ provinceId: 7, cityId: 292 });
    const result = v.safeParse(valibotEntry.provinceCitySchema, { provinceId: 28, cityId: 292 });
    expect(result.success).toBe(false);
    expect(v.getDotPath(result.issues![0]!)).toBe('cityId');
  });

  it('supports custom messages', () => {
    const schemas = valibotEntry.createValibotSchemas({ province: 'Invalid province' });
    expect(v.safeParse(schemas.provinceId, 0).issues?.[0]?.message).toBe('Invalid province');
  });
});
