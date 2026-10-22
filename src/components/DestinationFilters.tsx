import { useMemo, useState } from 'react';
import type { DestinationClimate } from '../data/climate';
import { filterDestinations } from '../data/filter-destinations';
import './DestinationFilters.css';

interface Props {
  destinations: DestinationClimate[];
}

export default function DestinationFilters({ destinations }: Props) {
  const [month, setMonth] = useState(7);
  const [minimumTemperature, setMinimumTemperature] = useState('');
  const [maximumRainfall, setMaximumRainfall] = useState('');
  const monthOptions = destinations[0]?.climate.months ?? [];

  const matches = useMemo(() => {
    return filterDestinations(destinations, {
      month,
      minimumTemperature: minimumTemperature === '' ? undefined : Number(minimumTemperature),
      maximumRainfall: maximumRainfall === '' ? undefined : Number(maximumRainfall),
    });
  }, [destinations, maximumRainfall, minimumTemperature, month]);

  return (
    <section aria-labelledby="find-destinations">
      <h2 id="find-destinations">Find a destination</h2>
      <form className="filters" onSubmit={(event) => event.preventDefault()}>
        <div>
          <label htmlFor="month">Month</label>
          <select id="month" value={month} onChange={(event) => setMonth(Number(event.target.value))}>
            {monthOptions.map((option) => <option key={option.month} value={option.month}>{option.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="minimum-temperature">Minimum mean temperature (°C)</label>
          <input id="minimum-temperature" type="number" inputMode="decimal" value={minimumTemperature} onChange={(event) => setMinimumTemperature(event.target.value)} />
        </div>
        <div>
          <label htmlFor="maximum-rainfall">Maximum rainfall (mm/month)</label>
          <input id="maximum-rainfall" type="number" min="0" inputMode="decimal" value={maximumRainfall} onChange={(event) => setMaximumRainfall(event.target.value)} />
        </div>
      </form>

      <p aria-live="polite" className="result-count">{matches.length} {matches.length === 1 ? 'destination' : 'destinations'} match your filters.</p>
      {matches.length === 0 ? (
        <p className="empty-state">No destinations match those filters. Try lowering the temperature or allowing more rainfall.</p>
      ) : (
        <div className="destination-grid">
          {matches.map(({ destination, climate }) => (
            <article className="destination-card" key={destination.destination.id}>
              <h3><a href={`/destinations/${destination.destination.id}/`}>{destination.destination.name}</a></h3>
              <p>{destination.destination.country}</p>
              <dl>
                <div><dt>Mean temperature</dt><dd>{climate.meanTemperatureCelsius.toFixed(1)} °C</dd></div>
                <div><dt>Average daily high</dt><dd>{climate.averageDailyMaximumTemperatureCelsius.toFixed(1)} °C</dd></div>
                <div><dt>Typical rainfall</dt><dd>{climate.meanMonthlyPrecipitationMm.toFixed(0)} mm/month</dd></div>
                <div><dt>Solar radiation</dt><dd>{climate.meanDailySolarRadiationKwhM2.toFixed(1)} kWh/m²/day</dd></div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
