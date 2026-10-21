export const monthLabels = [
  ['JAN', 'January'], ['FEB', 'February'], ['MAR', 'March'], ['APR', 'April'],
  ['MAY', 'May'], ['JUN', 'June'], ['JUL', 'July'], ['AUG', 'August'],
  ['SEP', 'September'], ['OCT', 'October'], ['NOV', 'November'], ['DEC', 'December'],
];

export function normalizeClimateResponse(payload, { destination, period, apiUrl, retrievedAt }) {
  const values = payload?.properties?.parameter?.T2M;
  const details = payload?.parameters?.T2M;
  const fillValue = payload?.header?.fill_value;
  const coordinates = payload?.geometry?.coordinates;

  if (details?.units !== 'C' || details?.longname !== 'Temperature at 2 Meters') {
    throw new Error('NASA POWER response did not identify T2M as temperature at 2 metres in Celsius.');
  }
  if (!Number.isFinite(fillValue) || !Array.isArray(coordinates) || coordinates.length < 3) {
    throw new Error('NASA POWER response is missing its fill value or representative point metadata.');
  }
  if (!payload?.header?.range?.includes(`January ${period.startYear} - December ${period.endYear}`)) {
    throw new Error(`NASA POWER response does not confirm the requested ${period.startYear}–${period.endYear} climatology period.`);
  }

  const months = monthLabels.map(([key, label], index) => {
    const value = values?.[key];
    if (!Number.isFinite(value) || value === fillValue) {
      throw new Error(`NASA POWER returned a missing or invalid T2M value for ${key}.`);
    }
    return { month: index + 1, label, meanCelsius: value };
  });

  return {
    schemaVersion: 1,
    destination: {
      id: destination.id,
      name: destination.name,
      coordinates: { latitude: destination.latitude, longitude: destination.longitude },
      returnedCoordinates: {
        longitude: coordinates[0],
        latitude: coordinates[1],
        elevationMeters: coordinates[2],
      },
    },
    climate: {
      metric: 'mean-temperature-at-2m',
      unit: '°C',
      period: {
        ...period,
        description: `January ${period.startYear}–December ${period.endYear}`,
      },
      months,
    },
    source: {
      name: 'NASA POWER',
      apiUrl,
      documentationUrl: 'https://power.larc.nasa.gov/docs/services/api/temporal/climatology/',
      parameter: 'T2M',
      parameterName: details.longname,
      apiVersion: payload.header.api.version,
      dataSources: payload.header.sources,
      fillValue,
      retrievedAt,
    },
  };
}
