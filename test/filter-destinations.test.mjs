import assert from 'node:assert/strict';
import test from 'node:test';
import { filterDestinations } from '../src/data/filter-destinations.js';

function destination(id, temperature, rainfall) {
  return {
    destination: { id },
    climate: {
      months: [{
        month: 7,
        label: 'July',
        meanTemperatureCelsius: temperature,
        meanMonthlyPrecipitationMm: rainfall,
      }],
    },
  };
}

test('filters the selected month by minimum temperature and maximum rainfall', () => {
  const matches = filterDestinations([
    destination('warm-and-dry', 28, 8),
    destination('cool-and-dry', 19, 5),
    destination('warm-and-wet', 27, 80),
  ], { month: 7, minimumTemperature: 25, maximumRainfall: 20 });

  assert.deepEqual(matches.map(({ destination: item }) => item.destination.id), ['warm-and-dry']);
});

test('sorts unfiltered matches from warmest to coolest', () => {
  const matches = filterDestinations([
    destination('mild', 22, 4),
    destination('hot', 31, 3),
  ], { month: 7 });

  assert.deepEqual(matches.map(({ destination: item }) => item.destination.id), ['hot', 'mild']);
});
