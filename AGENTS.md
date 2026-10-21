# Codex instructions — Where Is It Sunny?

## Product goal

Build a small, useful, low-maintenance travel website that helps users compare destinations by historical monthly climate. This is a hobby project alongside a full-time job. Optimize for simplicity, correctness, maintainability, and organic search usefulness—not premature scale.

## Technology and architecture

- Astro + TypeScript, with React only for genuinely interactive UI.
- Prefer static generation, static JSON data, and build-time scripts.
- Do not introduce a database, authentication, server runtime, CMS, paid service, state-management library, or complex infrastructure without explicit approval.
- Prefer built-in platform functionality and a small number of well-supported dependencies.
- Keep source data, normalization scripts, generated climate data, and UI concerns clearly separated.
- Use stable destination IDs/slugs. Do not use display names as data keys.
- Use semantic HTML, responsive layouts, keyboard-accessible controls, and readable typography.

## Climate-data integrity

- NASA POWER is a **candidate** source, not a validated production dependency yet.
- Verify endpoint behavior, supported parameters, response units, missing-value conventions, and data licenses before relying on it.
- Never invent real climate observations or silently replace missing measurements with zero.
- Solar radiation is not sunshine hours. Rainfall amount is not rainy-day count.
- Show the source, historical period, and representative coordinates or location where relevant.
- Do not claim that historical averages predict weather for a particular holiday.
- Keep test fixtures and sample values clearly labeled as synthetic.

## Working style

- Implement one roadmap milestone at a time; avoid speculative features.
- Before major changes, briefly state the intended files and approach.
- Prefer clear, straightforward TypeScript over elaborate abstractions.
- Add focused tests for data normalization, unit conversions, and filtering when these are implemented.
- Run available checks (typecheck, tests, build) after changes and report results accurately.
- Do not claim external API requests were tested unless they actually ran.
- Never commit secrets or real `.env` files.
- Do not add AI features, maps, accounts, booking engines, affiliate systems, or analytics until requested.

## First implementation task

Follow Milestone 1 in `docs/ROADMAP.md`: scaffold Astro with React/TypeScript, validate one NASA POWER climatology request, and render a simple 12-month temperature display for a representative Crete location. Keep this vertical slice small and testable.

After completing a milestone, update docs/ROADMAP.md to reflect the actual implementation status. Update README.md when setup instructions or supported functionality change. Avoid unnecessary documentation changes.
