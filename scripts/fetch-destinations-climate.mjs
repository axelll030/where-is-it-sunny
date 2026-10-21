import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { destinations } from './destinations.mjs';
import { normalizeClimateResponse } from './normalize-climate.mjs';

const period = { startYear: 1991, endYear: 2020 };
const baseUrl = 'https://power.larc.nasa.gov/api/temporal/climatology/point';

async function fetchDestinationClimate(destination) {
  const apiUrl = new URL(baseUrl);
  apiUrl.search = new URLSearchParams({
    parameters: 'T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN',
    community: 'RE',
    longitude: String(destination.longitude),
    latitude: String(destination.latitude),
    format: 'JSON',
    start: String(period.startYear),
    end: String(period.endYear),
  }).toString();

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`NASA POWER request for ${destination.id} failed: ${response.status} ${response.statusText}`);
  }

  return normalizeClimateResponse(await response.json(), {
    destination,
    period,
    apiUrl: apiUrl.toString(),
    retrievedAt: new Date().toISOString().slice(0, 10),
  });
}

const records = [];
for (let index = 0; index < destinations.length; index += 5) {
  records.push(...await Promise.all(destinations.slice(index, index + 5).map(fetchDestinationClimate)));
}

const outputUrl = new URL('../src/data/destinations.json', import.meta.url);
await mkdir(new URL('../src/data/', import.meta.url), { recursive: true });
await writeFile(outputUrl, `${JSON.stringify(records, null, 2)}\n`);
console.log(`Wrote ${records.length} destinations to ${fileURLToPath(outputUrl)}`);
