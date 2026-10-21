import assert from 'node:assert/strict';
import test from 'node:test';
import { monthLabels, normalizeClimateResponse } from '../scripts/normalize-climate.mjs';

const destination = {
  id: 'synthetic-location',
  name: 'Synthetic location',
  latitude: 35,
  longitude: 25,
};
const period = { startYear: 1991, endYear: 2020 };

function syntheticResponse() {
  return {
    geometry: { coordinates: [25, 35, 100] },
    properties: {
      parameter: { T2M: Object.fromEntries(monthLabels.map(([key], index) => [key, index + 10])) },
    },
    header: {
      api: { version: 'test' },
      fill_value: -999,
      range: 'January 1991 - December 2020',
      sources: ['SYNTHETIC'],
    },
    parameters: { T2M: { units: 'C', longname: 'Temperature at 2 Meters' } },
  };
}

test('normalizes 12 valid monthly temperatures', () => {
  const data = normalizeClimateResponse(syntheticResponse(), {
    destination,
    period,
    apiUrl: 'https://example.test/climate',
    retrievedAt: '2026-10-21',
  });

  assert.equal(data.climate.months.length, 12);
  assert.deepEqual(data.climate.months[0], { month: 1, label: 'January', meanCelsius: 10 });
  assert.equal(data.climate.unit, '°C');
});

test('rejects a missing-value marker instead of publishing it', () => {
  const response = syntheticResponse();
  response.properties.parameter.T2M.FEB = -999;

  assert.throws(
    () => normalizeClimateResponse(response, { destination, period, apiUrl: 'https://example.test/climate', retrievedAt: '2026-10-21' }),
    /missing or invalid T2M value for FEB/,
  );
});
