export interface MonthlyTemperature {
  month: number;
  label: string;
  meanCelsius: number;
}

export interface DestinationClimate {
  schemaVersion: 1;
  destination: {
    id: string;
    name: string;
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
    metric: 'mean-temperature-at-2m';
    unit: '°C';
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
    parameter: 'T2M';
    parameterName: string;
    apiVersion: string;
    dataSources: string[];
    fillValue: number;
    retrievedAt: string;
  };
}
