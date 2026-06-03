---
name: landing-deploy
description: Deploy the Thesis landing page to Netlify and verify it's live. Use when the user says "deploy the landing page", "update the website", "push to netlify", "ship the site", or mentions deploying or updating makeyourthesis.com, the landing page, or the marketing site.
---

# Landing Deploy

Deploy the Thesis landing page to Netlify and verify key pages are live.

## Deployment

Deploy the `landing/` directory to production. Always use the absolute path:

```bash
npx netlify deploy --dir=/Users/jaidenrabatin/Projects/thesis/landing --prod
```

This uploads the landing directory to Netlify and takes the deploy live. Wait for "Deploy is live!" confirmation.

## Verification

After deploy completes, verify the main page and support page are accessible:

```bash
curl -s -o /dev/null -w "%{http_code}" https://makeyourthesis.com
```

```bash
curl -s -o /dev/null -w "%{http_code}" https://makeyourthesis.com/support
```

Both should return `200`. If either returns an error code, report which URL failed and the status code.

## Landing page structure

| Thing | Value |
|-------|-------|
| Deploy dir | `/Users/jaidenrabatin/Projects/thesis/landing` |
| Production URL | `https://makeyourthesis.com` |
| Support page | `/support` (rewrites to `support.html`) |
| Privacy | `/privacy` (rewrites to `support.html#privacy`) |
| Terms | `/terms` (rewrites to `support.html#terms`) |
| Security | `/security` (rewrites to `support.html#security`) |
| Redirects file | `landing/_redirects` |

## Important

Always use the **absolute path** `--dir=/Users/jaidenrabatin/Projects/thesis/landing` — never a relative path. Relative paths can resolve incorrectly depending on the current working directory, creating a `landing/landing` path that doesn't exist.
