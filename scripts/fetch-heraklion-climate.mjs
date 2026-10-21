import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { normalizeClimateResponse } from './normalize-climate.mjs';

const destination = {
  id: 'heraklion-crete',
  name: 'Heraklion, Crete',
  latitude: 35.3387,
  longitude: 25.1442,
};
const period = { startYear: 1991, endYear: 2020 };
const apiUrl = new URL('https://power.larc.nasa.gov/api/temporal/climatology/point');
apiUrl.search = new URLSearchParams({
  parameters: 'T2M',
  community: 'RE',
  longitude: String(destination.longitude),
  latitude: String(destination.latitude),
  format: 'JSON',
  start: String(period.startYear),
  end: String(period.endYear),
}).toString();

const response = await fetch(apiUrl);
if (!response.ok) {
  throw new Error(`NASA POWER request failed: ${response.status} ${response.statusText}`);
}

const payload = await response.json();
const normalized = normalizeClimateResponse(payload, {
  destination,
  period,
  apiUrl: apiUrl.toString(),
  retrievedAt: new Date().toISOString().slice(0, 10),
});

const outputUrl = new URL('../src/data/destinations/heraklion-crete.json', import.meta.url);
await mkdir(new URL('../src/data/destinations/', import.meta.url), { recursive: true });
await writeFile(outputUrl, `${JSON.stringify(normalized, null, 2)}\n`);
console.log(`Wrote ${fileURLToPath(outputUrl)}`);
