export interface MonthlyTemperature {
  month: number;
  label: string;
  meanTemperatureCelsius: number;
  meanDailyPrecipitationMm: number;
  meanMonthlyPrecipitationMm: number;
  meanDailySolarRadiationKwhM2: number;
}

export interface DestinationClimate {
  schemaVersion: 1;
  destination: {
    id: string;
    name: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    returnedCoordinates: {
      latitude: number;
      longitude: number;
      elevationMeters: number;
    };
  };
  climate: {
    period: {
      startYear: number;
      endYear: number;
      description: string;
    };
    months: MonthlyTemperature[];
  };
  source: {
    name: string;
    apiUrl: string;
    documentationUrl: string;
    parameters: {
      temperature: { code: 'T2M'; name: string; unit: '°C' };
      precipitation: {
        code: 'PRECTOTCORR';
        name: string;
        sourceUnit: 'mm/day';
        displayedUnit: 'mm per month';
        conversion: string;
      };
      solarRadiation: { code: 'ALLSKY_SFC_SW_DWN'; name: string; unit: 'kWh/m²/day' };
    };
    apiVersion: string;
    dataSources: string[];
    fillValue: number;
    retrievedAt: string;
  };
}
