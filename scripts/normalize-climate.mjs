export const monthLabels = [
  ['JAN', 'January'], ['FEB', 'February'], ['MAR', 'March'], ['APR', 'April'],
  ['MAY', 'May'], ['JUN', 'June'], ['JUL', 'July'], ['AUG', 'August'],
  ['SEP', 'September'], ['OCT', 'October'], ['NOV', 'November'], ['DEC', 'December'],
];

const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function requireParameter(payload, code, units, longname) {
  const parameter = payload?.parameters?.[code];
  if (parameter?.units !== units || parameter?.longname !== longname) {
    throw new Error(`NASA POWER response did not identify ${code} as ${longname} in ${units}.`);
  }
  return parameter;
}

function requireValue(values, key, fillValue, code) {
  const value = values?.[key];
  if (!Number.isFinite(value) || value === fillValue) {
    throw new Error(`NASA POWER returned a missing or invalid ${code} value for ${key}.`);
  }
  return value;
}

export function normalizeClimateResponse(payload, { destination, period, apiUrl, retrievedAt }) {
  const parameters = payload?.properties?.parameter;
  const fillValue = payload?.header?.fill_value;
  const coordinates = payload?.geometry?.coordinates;

  const temperature = requireParameter(payload, 'T2M', 'C', 'Temperature at 2 Meters');
  const precipitation = requireParameter(payload, 'PRECTOTCORR', 'mm/day', 'Precipitation Corrected');
  const solarRadiation = requireParameter(payload, 'ALLSKY_SFC_SW_DWN', 'kW-hr/m^2/day', 'All Sky Surface Shortwave Downward Irradiance');
  if (!Number.isFinite(fillValue) || !Array.isArray(coordinates) || coordinates.length < 3) {
    throw new Error('NASA POWER response is missing its fill value or representative point metadata.');
  }
  if (!payload?.header?.range?.includes(`January ${period.startYear} - December ${period.endYear}`)) {
    throw new Error(`NASA POWER response does not confirm the requested ${period.startYear}–${period.endYear} climatology period.`);
  }

  const months = monthLabels.map(([key, label], index) => {
    const precipitationDailyMm = requireValue(parameters?.PRECTOTCORR, key, fillValue, 'PRECTOTCORR');
    return {
      month: index + 1,
      label,
      meanTemperatureCelsius: requireValue(parameters?.T2M, key, fillValue, 'T2M'),
      meanDailyPrecipitationMm: precipitationDailyMm,
      meanMonthlyPrecipitationMm: Number((precipitationDailyMm * daysInMonth[index]).toFixed(2)),
      meanDailySolarRadiationKwhM2: requireValue(parameters?.ALLSKY_SFC_SW_DWN, key, fillValue, 'ALLSKY_SFC_SW_DWN'),
    };
  });

  return {
    schemaVersion: 1,
    destination: {
      id: destination.id,
      name: destination.name,
      country: destination.country,
      coordinates: { latitude: destination.latitude, longitude: destination.longitude },
      returnedCoordinates: {
        longitude: coordinates[0],
        latitude: coordinates[1],
        elevationMeters: coordinates[2],
      },
    },
    climate: {
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
      parameters: {
        temperature: { code: 'T2M', name: temperature.longname, unit: '°C' },
        precipitation: {
          code: 'PRECTOTCORR',
          name: precipitation.longname,
          sourceUnit: precipitation.units,
          displayedUnit: 'mm per month',
          conversion: 'Daily climatological precipitation multiplied by the calendar days in each month.',
        },
        solarRadiation: { code: 'ALLSKY_SFC_SW_DWN', name: solarRadiation.longname, unit: 'kWh/m²/day' },
      },
      apiVersion: payload.header.api.version,
      dataSources: payload.header.sources,
      fillValue,
      retrievedAt,
    },
  };
}
