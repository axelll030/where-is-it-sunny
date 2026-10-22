import assert from 'node:assert/strict';
import test from 'node:test';
import { monthLabels, normalizeClimateResponse, validateClimateDataset } from '../scripts/normalize-climate.mjs';

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
      parameter: {
        T2M: Object.fromEntries(monthLabels.map(([key], index) => [key, index + 10])),
        T2M_MAX_AVG: Object.fromEntries(monthLabels.map(([key], index) => [key, index + 15])),
        PRECTOTCORR: Object.fromEntries(monthLabels.map(([key], index) => [key, index + 1])),
        ALLSKY_SFC_SW_DWN: Object.fromEntries(monthLabels.map(([key], index) => [key, index + 2])),
      },
    },
    header: {
      api: { version: 'test' },
      fill_value: -999,
      range: 'January 1991 - December 2020',
      sources: ['SYNTHETIC'],
    },
    parameters: {
      T2M: { units: 'C', longname: 'Temperature at 2 Meters' },
      T2M_MAX_AVG: { units: 'C', longname: 'Temperature at 2 Meters Maximum Average' },
      PRECTOTCORR: { units: 'mm/day', longname: 'Precipitation Corrected' },
      ALLSKY_SFC_SW_DWN: { units: 'kW-hr/m^2/day', longname: 'All Sky Surface Shortwave Downward Irradiance' },
    },
  };
}

test('normalizes 12 valid monthly climate measurements', () => {
  const data = normalizeClimateResponse(syntheticResponse(), {
    destination,
    period,
    apiUrl: 'https://example.test/climate',
    retrievedAt: '2026-10-21',
  });

  assert.equal(data.climate.months.length, 12);
  assert.deepEqual(data.climate.months[0], {
    month: 1,
    label: 'January',
    meanTemperatureCelsius: 10,
    averageDailyMaximumTemperatureCelsius: 15,
    meanDailyPrecipitationMm: 1,
    meanMonthlyPrecipitationMm: 31,
    meanDailySolarRadiationKwhM2: 2,
  });
  assert.equal(data.source.parameters.solarRadiation.unit, 'kWh/m²/day');
});

test('rejects a missing-value marker instead of publishing it', () => {
  const response = syntheticResponse();
  response.properties.parameter.PRECTOTCORR.FEB = -999;

  assert.throws(
    () => normalizeClimateResponse(response, { destination, period, apiUrl: 'https://example.test/climate', retrievedAt: '2026-10-21' }),
    /missing or invalid PRECTOTCORR value for FEB/,
  );
});

test('rejects an invalid daily maximum instead of publishing it', () => {
  const response = syntheticResponse();
  response.properties.parameter.T2M_MAX_AVG.JAN = 5;

  assert.throws(
    () => normalizeClimateResponse(response, { destination, period, apiUrl: 'https://example.test/climate', retrievedAt: '2026-10-21' }),
    /daily maximum below the mean temperature for JAN/,
  );
});

test('validates generated records for consistent units and ranges', () => {
  const record = normalizeClimateResponse(syntheticResponse(), {
    destination,
    period,
    apiUrl: 'https://example.test/climate',
    retrievedAt: '2026-10-21',
  });
  validateClimateDataset([record]);
  record.climate.months[0].meanDailySolarRadiationKwhM2 = 31;

  assert.throws(() => validateClimateDataset([record]), /invalid measurement/);
});
