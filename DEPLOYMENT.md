# GCP Deployment Guide

This project deploys the **arrows-ts** web app to **Google App Engine** on Google Cloud Platform (GCP). Builds and deploys are run by **Cloud Build**.

## Overview

- **Production**: Default App Engine service. Typically at `https://<project-id>.appspot.com` (or your custom domain, e.g. arrows.neo4jlabs.com).
- **Staging**: Optional App Engine service `staging`. At `https://staging-dot-<project-id>.appspot.com`. Use this to verify releases before production.

## Prerequisites

### 1. GCP project and billing

- A GCP project (this repo was set up with project ID `arrows-app-295615`).
- Billing enabled on the project (App Engine and Cloud Build require it).

Login to gcloud:
```bash
gcloud auth login
```

Check that you have access to the arrows-app project:
```bash
gcloud projects list | grep arrows-app
```

Set arrows-app as the current project:
```bash
gcloud config set project arrows-app-295615
```

### 2. APIs enabled

Ensure these APIs are enabled in the project:

- **App Engine Admin API** – for `gcloud app deploy`
- **Cloud Build API** – for running Cloud Build
- **Secret Manager API** – for build-time secrets (Google API key)

Enable via Console: [APIs & Services](https://console.cloud.google.com/apis/library) or:

```bash
gcloud services enable appengine.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com --project=arrows-app-295615
```

### 3. Google API key (Google Drive)

The app uses the Google Drive API (and related auth) for saving/opening files. The **build** needs a Google API key at build time; it is baked into the front-end as `VITE_GOOGLE_API_KEY`.

- Create or use an existing **API key** in [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials).
- Restrict the key as needed (e.g. to the Drive API and your app’s URLs).
- Create a **Secret Manager** secret with the key value so Cloud Build can inject it without putting it in source:

  ```bash
  echo -n "YOUR_GOOGLE_API_KEY" | gcloud secrets create google-api-key --data-file=- --project=arrows-app-295615
  # If the secret already exists, add a new version:
  echo -n "YOUR_GOOGLE_API_KEY" | gcloud secrets versions add google-api-key --data-file=- --project=arrows-app-295615
  ```

- Grant Cloud Build’s service account access to read the secret:

  ```bash
  PROJECT_NUMBER=$(gcloud projects describe arrows-app-295615 --format='value(projectNumber)')
  gcloud secrets add-iam-policy-binding google-api-key \
    --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --project=arrows-app-295615
  ```

The `cloudbuild.yaml` in this repo references:

- Secret: `projects/arrows-app-295615/secrets/google-api-key/versions/2`

If you use a different project or secret/version, update the `availableSecrets` section in `cloudbuild.yaml` accordingly.

### 4. Local tooling (optional, for manual deploys)

- **gcloud CLI**: [Install the Google Cloud SDK](https://cloud.google.com/sdk/docs/install) and run `gcloud auth login` and `gcloud config set project arrows-app-295615`.
- **Node 18**: For local `npm run build` (same as in Cloud Build).

## Publishing workflow

### How deploys run

1. **Trigger**: A Cloud Build **trigger** (e.g. on push to `main`, or manual “Deploy to staging”) starts a build.
2. **Build**: Cloud Build runs the steps in `cloudbuild.yaml`:
   - `npm install`
   - `npm run build` (with `VITE_GOOGLE_API_KEY` from Secret Manager)
   - `gcloud app deploy [app.yaml | app.staging.yaml]`
3. **Deploy**: App Engine deploys the contents of `dist/apps/arrows-ts/` (and any other files referenced in the chosen `app*.yaml`).

No separate “publish” step is required for the website; pushing to the branch that’s connected to the production trigger (or running the staging trigger) is the publish workflow.

### Production deploy

- **Typical setup**: A trigger that runs on push to `main` (or your default branch), using the default substitution `_APP_YAML=app.yaml`.
- **Manual from your machine** (requires gcloud and a built app):

  ```bash
  npm install
  npm run build   # needs VITE_GOOGLE_API_KEY in env if you want Drive to work
  gcloud app deploy --project=arrows-app-295615
  ```

### Staging deploy

- **Recommended**: A separate Cloud Build trigger (e.g. “Deploy to staging”) that sets substitution:
  - `_APP_YAML=app.staging.yaml`
  Run it manually or from a branch (e.g. `staging`).
- **Manual from your machine**:

  ```bash
  npm install
  npm run build
  gcloud app deploy app.staging.yaml --project=arrows-app-295615
  ```

Staging URL: `https://staging-dot-arrows-app-295615.appspot.com` (replace project ID if different).

## Configuration reference

| Item | Location | Purpose |
|------|----------|---------|
| Build/deploy steps | `cloudbuild.yaml` | Cloud Build pipeline: install, build, deploy |
| Production App Engine config | `app.yaml` | Handlers, static files from `dist/apps/arrows-ts/` |
| Staging App Engine config | `app.staging.yaml` | Same as production with `service: staging` |
| Files ignored on deploy | `.gcloudignore` | Reduces upload size (e.g. `.git`, non-essential files) |
| Google API key (build) | Secret Manager `google-api-key` | Injected as `VITE_GOOGLE_API_KEY` during build |

## Setting up Cloud Build triggers

1. Open [Cloud Build → Triggers](https://console.cloud.google.com/cloud-build/triggers).
2. **Production**: Create a trigger (e.g. on push to `main`). In “Substitution variables”, either leave defaults or set `_APP_YAML` = `app.yaml`.
3. **Staging**: Create a trigger (e.g. manual or on push to `staging`). Set substitution variable `_APP_YAML` = `app.staging.yaml`.

Both triggers can use the same `cloudbuild.yaml`; the only difference is which app YAML is deployed.

## Troubleshooting

- **Build fails on “secret not found”**: Check Secret Manager secret name/version and that the Cloud Build service account has `roles/secretmanager.secretAccessor` on that secret.
- **Drive / Picker not working**: Ensure the API key is set in the build (Secret Manager) and that the key has the Drive API (and any required OAuth client IDs) configured in Google Cloud Console.
- **Wrong project**: Use `gcloud config set project arrows-app-295615` (or your project ID) and ensure the trigger runs in the same project.
