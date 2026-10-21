# Roadmap

This roadmap is deliberately small. Work through milestones in order. Each milestone should leave the project usable and easy to continue.

## Milestone 0 — Repository foundation

- [x] Define product purpose, technical boundaries, and initial MVP
- [x] Create README, AGENTS, roadmap, and gitignore
- [ ] Commit repository foundation

## Milestone 1 — Data proof of concept

- [ ] Scaffold Astro + React + TypeScript in the repository root
- [ ] Add basic scripts for local development, build, and type checking
- [ ] Select one representative location: Heraklion, Crete
- [ ] Verify NASA POWER climatology endpoint and temperature parameters against current documentation
- [ ] Fetch data for 12 months using a documented historical period
- [ ] Validate units, missing values, and returned metadata
- [ ] Normalize data into a typed JSON format; record source and period
- [ ] Display a basic 12-month temperature table or chart
- [ ] Ensure the static site builds successfully

**Done when:** a visitor can open a static page and inspect 12 real, source-labeled monthly temperature values for the selected location. No need for polished design.

## Milestone 2 — Curated destinations and filters

- [ ] Define stable destination metadata and representative coordinates
- [ ] Curate an initial 10 destinations, then expand toward 30
- [ ] Add validated monthly precipitation and solar-radiation metrics
- [ ] Implement month, temperature, and rainfall filters
- [ ] Show responsive destination cards and meaningful empty states
- [ ] Add data validation tests

## Milestone 3 — Comparison and destination pages

- [ ] Compare two destinations across months
- [ ] Generate static destination pages from slugs
- [ ] Explain local climate variation and the limitations of historical averages
- [ ] Add methodology and data attribution pages

## Milestone 4 — SEO and public launch

- [ ] Create useful, non-duplicative monthly landing pages
- [ ] Add titles, meta descriptions, canonical URLs, sitemap, and robots guidance
- [ ] Check accessibility, responsive design, performance, and broken links
- [ ] Deploy to a free static host
- [ ] Connect Google Search Console and minimal privacy-conscious analytics if desired

## Later, only if there is evidence of demand

- More destinations and regions
- More nuanced climate indicators, if reliable sources exist
- Improved comparison and discovery UX
- Optional monetization after evaluating licensing and privacy requirements

## Explicitly out of scope for MVP

Live forecasts, flight prices, hotel bookings, user accounts, saved trips, a database, AI recommendations, and interactive maps.
