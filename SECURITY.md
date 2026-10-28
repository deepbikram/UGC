# Security

## Reporting a vulnerability

Please do not open a public issue for a security problem. Open a private
[security advisory](https://github.com/ufkrdev/portico/security/advisories/new)
on this repository instead, and give it a few days before disclosing anywhere
else.

## What Portico does

- Passwords: bcrypt, cost 10. Never logged, never returned by an API.
- Sessions: HS256 JWT signed with `AUTH_SECRET`, in an httpOnly, sameSite `lax`
  cookie, seven-day expiry, `secure` in production.
- Authorisation: middleware rejects unauthenticated requests to every page and
  every `/api` route; `/admin/*` additionally requires the admin role; each
  handler re-checks ownership rather than trusting the path.
- Uploads: extension-stripped generated filenames, a MIME allowlist, a 25 MB
  cap, stored under `data/uploads/<userId>/` outside the web root, and served
  only through a route that checks the session.
- Deletion: removing a client cascades to their progress, forms, deliverables,
  files, messages, and notes.

## What it does not do

Portico is a self-hosted application with a small trust boundary. It has no rate
limiting, no 2FA, no audit-log tamper protection, and no CSRF tokens beyond the
sameSite cookie. If you are running it somewhere hostile, put it behind a
reverse proxy that adds what you need.

## The published credentials

`admin@portico.dev` / `portico-admin` are documented in the README so that a
fresh clone can be opened and understood in one command. They are created by
`npm run setup` on your own machine, in your own database. **Change them before
the portal is reachable from the internet**, either by setting `ADMIN_PASSWORD`
before running setup or from Account → Change password.
