# Patch Notes From Another Universe

A short-round, real-time party game where a group collectively creates ridiculous release notes for fictional software.

Players join a room with a six-character code. Each round, one player judges while everyone else plays a card or writes a custom answer. The room state is held in a Cloudflare Durable Object, so players stay in sync without a separate chat app.

## Technology

- Cloudflare Worker serves the game and WebSocket endpoint
- Cloudflare Durable Object holds one live game room and its SQLite-backed state
- Plain HTML, CSS, and browser JavaScript in `public/`

## Run locally

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open `http://localhost:8787`. Local development uses a local Durable Object simulation, so it will not touch the live game.

## Deploy to Cloudflare

The first deployer needs a Cloudflare account with Workers enabled. They may also need to choose a `workers.dev` subdomain in the Cloudflare dashboard once.

```sh
npm ci
npx wrangler login
npm run deploy:dry-run
npm run deploy
```

Wrangler prints the live URL after a successful deploy. Future deploys with the same `wrangler.jsonc` update the existing `patch-notes-universe` Worker and preserve its configuration.

For a non-interactive CI deployment, set a Cloudflare API token as `CLOUDFLARE_API_TOKEN` in the CI provider and run `npm ci` followed by `npm run deploy`. Keep tokens and any future `.dev.vars` files out of Git.

### Important Durable Object note

`wrangler.jsonc` contains the initial `v1` Durable Object migration. If the `GameRoom` class or its persistence needs a migration later, add a new migration entry; do not rewrite an already-deployed migration.

## Publish this repository privately on GitHub

After committing the prepared project, create a private GitHub repository and push it. With the GitHub CLI authenticated, from this directory:

```sh
gh repo create patch-notes-from-another-universe --private --source=. --remote=origin --push
```

Or create an empty **private** repository in GitHub, then connect and push it:

```sh
git remote add origin git@github.com:YOUR_GITHUB_USERNAME/patch-notes-from-another-universe.git
git push -u origin main
```

## Useful commands

```sh
npm run dev             # Local Worker with local room state
npm run deploy:dry-run  # Validate the production bundle and bindings
npm run deploy          # Deploy to Cloudflare
npm run types           # Regenerate Cloudflare Worker type declarations
```
