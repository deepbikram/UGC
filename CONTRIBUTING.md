# Contributing to Portico

Thanks for looking. Portico is small on purpose, and the best contributions keep
it that way.

## Getting it running

```bash
npm install
npm run setup
npm run seed
npm run dev          # http://localhost:5800
```

`npm run reset -- --yes` wipes the database and uploads if you want to start
clean.

## Before you open a pull request

```bash
npx tsc --noEmit     # types must pass
npm run build        # the production build must pass
```

Then click through the thing you changed as both an admin and a client. There is
no test suite yet; if you would like to add one, that is a genuinely useful PR.

## What makes a change easy to merge

- **Keep the dependency list short.** Portico has eight runtime dependencies and
  no API keys. A PR that adds a service integration is much more likely to land
  as an optional adapter than as a requirement.
- **Match the code around you.** Comments explain *why*, not *what*. Server
  components fetch; client components render. Types live next to the thing they
  describe.
- **One concern per PR.** A refactor and a feature in the same diff is two PRs.
- **Design changes come with a screenshot.** The look is a feature.

## Good first issues

- A test suite (Vitest and Playwright would both fit).
- An email adapter for invites, behind an optional env var.
- A storage adapter so uploads can go somewhere other than the local disk.
- Internationalisation of the client-facing strings.
- Accessibility passes on the accordion and the drawer.

## Reporting a bug

Say what you did, what you expected, and what happened, with the Node version
and whether you were in dev or a production build. A failing repro beats a
perfect description.
