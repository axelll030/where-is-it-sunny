/**
 * Filter climate records for a selected month and return them warmest first.
 * Empty filter values are represented by `undefined`.
 *
 * @param {import('./climate').DestinationClimate[]} destinations
 * @param {{ month: number, minimumTemperature?: number, maximumRainfall?: number }} filters
 */
export function filterDestinations(destinations, filters) {
  const minimumTemperature = filters.minimumTemperature ?? -Infinity;
  const maximumRainfall = filters.maximumRainfall ?? Infinity;
  /** @type {{ destination: import('./climate').DestinationClimate, climate: import('./climate').MonthlyTemperature }[]} */
  const matches = [];

  for (const destination of destinations) {
    const climate = destination.climate.months.find((item) => item.month === filters.month);
    if (
      climate
      && climate.meanTemperatureCelsius >= minimumTemperature
      && climate.meanMonthlyPrecipitationMm <= maximumRainfall
    ) {
      matches.push({ destination, climate });
    }
  }

  return matches.sort((a, b) => b.climate.meanTemperatureCelsius - a.climate.meanTemperatureCelsius);
}
