# Deploy Travel Packing List

This project is a static site. You can deploy it directly to Vercel without a build step.

## Files

- `index.html`
- `styles.css`
- `script.js`
- `vercel.json`

## Recommended: Vercel

1. Create a GitHub repo for this folder.
2. Push the project to GitHub.
3. In Vercel, click `Add New...` -> `Project`.
4. Import the GitHub repo.
5. Leave the framework as `Other`.
6. Leave the build command empty.
7. Leave the output directory empty.
8. Deploy.

## Supabase setup required

Because this app uses Supabase Auth, update your Supabase project after you know the deployed URL.

In Supabase:

1. Go to `Authentication` -> `URL Configuration`.
2. Set `Site URL` to your deployed production URL.
   Example: `https://your-site.vercel.app`
3. Add that same URL to `Redirect URLs`.
4. If you also want preview deployments to work, add your Vercel preview domain pattern too.

## Local note

The app now uses a stable auth redirect based on:

- `window.location.origin`
- `window.location.pathname`

That makes sign-up confirmation safer in production than using the full current URL.

## Optional custom domain

After deployment, you can attach your own domain in Vercel:

1. Open the project in Vercel.
2. Go to `Settings` -> `Domains`.
3. Add your domain.
4. Then update Supabase `Site URL` and `Redirect URLs` to match that final domain.
