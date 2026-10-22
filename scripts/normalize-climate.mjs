export const monthLabels = [
  ['JAN', 'January'], ['FEB', 'February'], ['MAR', 'March'], ['APR', 'April'],
  ['MAY', 'May'], ['JUN', 'June'], ['JUL', 'July'], ['AUG', 'August'],
  ['SEP', 'September'], ['OCT', 'October'], ['NOV', 'November'], ['DEC', 'December'],
];

const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const metricRanges = {
  T2M: { minimum: -90, maximum: 70 },
  T2M_MAX_AVG: { minimum: -90, maximum: 70 },
  PRECTOTCORR: { minimum: 0, maximum: 100 },
  ALLSKY_SFC_SW_DWN: { minimum: 0, maximum: 30 },
};

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
  const range = metricRanges[code];
  if (range && (value < range.minimum || value > range.maximum)) {
    throw new Error(`NASA POWER returned an out-of-range ${code} value for ${key}.`);
  }
  return value;
}

function requireCoordinates(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length < 3 || !coordinates.every(Number.isFinite)) {
    throw new Error('NASA POWER response is missing its representative point metadata.');
  }
  const [longitude, latitude] = coordinates;
  if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
    throw new Error('NASA POWER returned representative point coordinates outside their valid ranges.');
  }
}

export function normalizeClimateResponse(payload, { destination, period, apiUrl, retrievedAt }) {
  const parameters = payload?.properties?.parameter;
  const fillValue = payload?.header?.fill_value;
  const coordinates = payload?.geometry?.coordinates;

  const temperature = requireParameter(payload, 'T2M', 'C', 'Temperature at 2 Meters');
  const averageDailyMaximumTemperature = requireParameter(
    payload,
    'T2M_MAX_AVG',
    'C',
    'Temperature at 2 Meters Maximum Average',
  );
  const precipitation = requireParameter(payload, 'PRECTOTCORR', 'mm/day', 'Precipitation Corrected');
  const solarRadiation = requireParameter(payload, 'ALLSKY_SFC_SW_DWN', 'kW-hr/m^2/day', 'All Sky Surface Shortwave Downward Irradiance');
  if (!Number.isFinite(fillValue)) {
    throw new Error('NASA POWER response is missing its fill value metadata.');
  }
  requireCoordinates(coordinates);
  if (!payload?.header?.range?.includes(`January ${period.startYear} - December ${period.endYear}`)) {
    throw new Error(`NASA POWER response does not confirm the requested ${period.startYear}–${period.endYear} climatology period.`);
  }

  const months = monthLabels.map(([key, label], index) => {
    const meanTemperatureCelsius = requireValue(parameters?.T2M, key, fillValue, 'T2M');
    const averageDailyMaximumTemperatureCelsius = requireValue(
      parameters?.T2M_MAX_AVG,
      key,
      fillValue,
      'T2M_MAX_AVG',
    );
    const precipitationDailyMm = requireValue(parameters?.PRECTOTCORR, key, fillValue, 'PRECTOTCORR');
    if (averageDailyMaximumTemperatureCelsius < meanTemperatureCelsius) {
      throw new Error(`NASA POWER returned a daily maximum below the mean temperature for ${key}.`);
    }
    return {
      month: index + 1,
      label,
      meanTemperatureCelsius,
      averageDailyMaximumTemperatureCelsius,
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
        averageDailyMaximumTemperature: {
          code: 'T2M_MAX_AVG',
          name: averageDailyMaximumTemperature.longname,
          unit: '°C',
        },
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

export function validateClimateDataset(records) {
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error('Generated climate data must contain at least one destination.');
  }

  const ids = new Set();
  const first = records[0];
  for (const record of records) {
    const id = record?.destination?.id;
    if (typeof id !== 'string' || !id || ids.has(id)) {
      throw new Error('Generated climate data contains a missing or duplicate destination ID.');
    }
    ids.add(id);

    if (
      record.source?.name !== 'NASA POWER'
      || record.source?.parameters?.temperature?.unit !== '°C'
      || record.source?.parameters?.averageDailyMaximumTemperature?.unit !== '°C'
      || record.source?.parameters?.precipitation?.sourceUnit !== 'mm/day'
      || record.source?.parameters?.precipitation?.displayedUnit !== 'mm per month'
      || record.source?.parameters?.solarRadiation?.unit !== 'kWh/m²/day'
    ) {
      throw new Error(`Generated climate data has inconsistent metric metadata for ${id}.`);
    }
    if (
      record.climate?.period?.startYear !== first.climate?.period?.startYear
      || record.climate?.period?.endYear !== first.climate?.period?.endYear
      || record.climate?.months?.length !== monthLabels.length
    ) {
      throw new Error(`Generated climate data has an inconsistent period or month count for ${id}.`);
    }
    const { latitude, longitude } = record.destination.coordinates ?? {};
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new Error(`Generated climate data has invalid requested coordinates for ${id}.`);
    }

    record.climate.months.forEach((month, index) => {
      if (month.month !== index + 1 || month.label !== monthLabels[index][1]) {
        throw new Error(`Generated climate data has an invalid month sequence for ${id}.`);
      }
      const mean = month.meanTemperatureCelsius;
      const high = month.averageDailyMaximumTemperatureCelsius;
      const rainfallDaily = month.meanDailyPrecipitationMm;
      const rainfallMonthly = month.meanMonthlyPrecipitationMm;
      const solar = month.meanDailySolarRadiationKwhM2;
      if (
        !Number.isFinite(mean) || mean < metricRanges.T2M.minimum || mean > metricRanges.T2M.maximum
        || !Number.isFinite(high) || high < mean || high > metricRanges.T2M_MAX_AVG.maximum
        || !Number.isFinite(rainfallDaily) || rainfallDaily < metricRanges.PRECTOTCORR.minimum || rainfallDaily > metricRanges.PRECTOTCORR.maximum
        || !Number.isFinite(rainfallMonthly) || rainfallMonthly < 0 || rainfallMonthly > metricRanges.PRECTOTCORR.maximum * daysInMonth[index]
        || !Number.isFinite(solar) || solar < metricRanges.ALLSKY_SFC_SW_DWN.minimum || solar > metricRanges.ALLSKY_SFC_SW_DWN.maximum
      ) {
        throw new Error(`Generated climate data has an invalid measurement for ${id} in ${month.label}.`);
      }
    });
  }
}
