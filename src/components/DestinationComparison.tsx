import { useMemo, useState } from 'react';
import type { DestinationClimate } from '../data/climate';
import './DestinationComparison.css';

interface Props {
  destinations: DestinationClimate[];
}

export default function DestinationComparison({ destinations }: Props) {
  const [firstId, setFirstId] = useState(destinations[0]?.destination.id ?? '');
  const [secondId, setSecondId] = useState(destinations[1]?.destination.id ?? '');
  const [first, second] = useMemo(() => [
    destinations.find((item) => item.destination.id === firstId),
    destinations.find((item) => item.destination.id === secondId),
  ], [destinations, firstId, secondId]);

  if (!first || !second) return null;

  function changeFirst(nextId: string) {
    setFirstId(nextId);
    if (nextId === secondId) setSecondId(firstId);
  }

  function changeSecond(nextId: string) {
    setSecondId(nextId);
    if (nextId === firstId) setFirstId(secondId);
  }

  return (
    <section aria-labelledby="compare-destinations">
      <h2 id="compare-destinations">Compare two destinations</h2>
      <div className="comparison-selects">
        <label>
          First destination
          <select value={firstId} onChange={(event) => changeFirst(event.target.value)}>
            {destinations.map((item) => <option key={item.destination.id} value={item.destination.id}>{item.destination.name}</option>)}
          </select>
        </label>
        <label>
          Second destination
          <select value={secondId} onChange={(event) => changeSecond(event.target.value)}>
            {destinations.map((item) => <option key={item.destination.id} value={item.destination.id}>{item.destination.name}</option>)}
          </select>
        </label>
      </div>

      <div className="comparison-table-wrap" tabIndex={0} aria-label="Monthly destination comparison">
        <table className="comparison-table">
          <caption>Historical monthly average temperature and rainfall</caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">{first.destination.name}</th>
              <th scope="col">{second.destination.name}</th>
            </tr>
          </thead>
          <tbody>
            {first.climate.months.map((firstMonth, index) => {
              const secondMonth = second.climate.months[index];
              return (
                <tr key={firstMonth.month}>
                  <th scope="row">{firstMonth.label}</th>
                  <td><strong>{firstMonth.meanTemperatureCelsius.toFixed(1)} °C</strong><span>{firstMonth.meanMonthlyPrecipitationMm.toFixed(0)} mm rainfall</span></td>
                  <td><strong>{secondMonth.meanTemperatureCelsius.toFixed(1)} °C</strong><span>{secondMonth.meanMonthlyPrecipitationMm.toFixed(0)} mm rainfall</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
