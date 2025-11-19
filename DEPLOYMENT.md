# Deployment Guide: GitHub Actions + Coolify

This guide explains how to deploy your app using GitHub Actions for building and Coolify for hosting.

## Why This Setup?

- ✅ **Faster builds** - GitHub Actions runners are more powerful
- ✅ **Saves VPS resources** - Build happens on GitHub's infrastructure
- ✅ **Better caching** - GitHub Actions caches dependencies
- ✅ **CI/CD pipeline** - Run tests, linting before deployment
- ✅ **Build once, deploy anywhere** - Same image works everywhere

## Setup Steps

### 1. Enable GitHub Container Registry (GHCR)

Your Docker images will be stored at: `ghcr.io/[your-username]/obrana-app`

**Make repository package public:**
1. Go to: https://github.com/[your-username]/obrana-app/packages
2. Find the `obrana-app` package
3. Click **Package Settings**
4. Scroll to **Danger Zone**
5. Click **Change visibility** → **Public**

### 2. Configure GitHub Secrets (Optional)

Go to: **Settings → Secrets and variables → Actions**

Optional secrets:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `COOLIFY_WEBHOOK_URL` | Coolify webhook URL | Auto-trigger deployment after build |

**Note:** `GITHUB_TOKEN` is automatically provided by GitHub Actions. You don't need to add it.

### 3. Configure Coolify to Use Pre-built Image

#### Option A: Manual Image Update (Simple)

1. In Coolify, go to your app settings
2. Change **Source** from "GitHub" to "Docker Image"
3. Set **Image** to: `ghcr.io/[your-username]/obrana-app:latest`
4. **Image Pull Policy**: "Always pull"
5. Add environment variables (DATABASE_URL, etc.)
6. Save and deploy

#### Option B: Webhook Auto-Deploy (Recommended)

1. In Coolify, go to your app settings
2. Click **Webhooks** tab
3. Copy the webhook URL
4. Add to GitHub Secrets as `COOLIFY_WEBHOOK_URL`
5. Uncomment the webhook trigger in `.github/workflows/build-and-deploy.yml`:

```yaml
- name: Trigger Coolify Deployment
  if: success()
  run: |
    curl -X POST "${{ secrets.COOLIFY_WEBHOOK_URL }}"
```

### 4. Test the Workflow

1. Push to `main` branch:
   ```bash
   git add .
   git commit -m "Add GitHub Actions workflow"
   git push origin main
   ```

2. Watch the build:
   - Go to **Actions** tab in GitHub
   - Watch the workflow run
   - Should take 2-5 minutes

3. Check the image:
   - Go to **Packages** tab
   - Should see `obrana-app` package with `latest` tag

4. Deploy in Coolify:
   - Manual: Click "Deploy" button
   - Auto: Happens automatically if webhook is configured

## Workflow Explained

```yaml
┌─────────────────────────────────────────────────┐
│  1. Code Push to main branch                    │
└────────────────┬────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────┐
│  2. GitHub Actions: Run Tests & Linting         │
│     - pnpm check (Biome)                        │
│     - pnpm test (Vitest)                        │
└────────────────┬────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────┐
│  3. GitHub Actions: Build Docker Image          │
│     - Uses Docker Buildx                        │
│     - Caches layers for speed                   │
│     - Runs multi-stage build                    │
└────────────────┬────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────┐
│  4. Push Image to GHCR                          │
│     - ghcr.io/username/obrana-app:latest        │
│     - ghcr.io/username/obrana-app:main-sha123   │
└────────────────┬────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────┐
│  5. (Optional) Trigger Coolify Webhook          │
└────────────────┬────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────┐
│  6. Coolify Pulls Image and Deploys             │
│     - Pulls from GHCR                           │
│     - Stops old container                       │
│     - Starts new container                      │
└─────────────────────────────────────────────────┘
```

## Build Times Comparison

### Before (Building in Coolify):
```
┌─ Git clone:        20s
├─ Install deps:     60s
├─ Build:           45s
└─ Total:          125s per deployment
```

### After (Pre-built in GitHub Actions):
```
GitHub Actions (happens in parallel):
┌─ Install deps:     30s (cached!)
├─ Tests:           10s
├─ Build:           25s
├─ Push image:      15s
└─ Total:           80s

Coolify Deployment:
┌─ Pull image:       10s
└─ Start:            5s
└─ Total:           15s
```

**Total time: ~95s (24% faster)**
**VPS CPU usage: ~90% less**

## Customization

### Skip Tests in Workflow

If you want to skip tests (faster builds):

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    # Remove: needs: test
```

### Build on Different Branches

To build on all branches (not just main):

```yaml
on:
  push:
    branches:
      - main
      - develop
      - staging
```

### Add Build Notifications

Add Slack/Discord notifications on build success/failure:

```yaml
- name: Notify on success
  if: success()
  run: |
    curl -X POST ${{ secrets.DISCORD_WEBHOOK }} \
      -H "Content-Type: application/json" \
      -d '{"content": "✅ Build succeeded!"}'
```

## Troubleshooting

### Image is private and Coolify can't pull

Make the package public (see Step 1) or configure Coolify with GHCR credentials.

### Webhook doesn't trigger deployment

1. Check the webhook URL is correct
2. Verify the secret is named `COOLIFY_WEBHOOK_URL`
3. Check Coolify logs for webhook requests

### Build is slow

Check if caching is working:
- Look for "Cache restored" in Actions logs
- First build is slow, subsequent builds should be faster

## Environment Variables

Remember to set these in **Coolify** (not GitHub):

- `DATABASE_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `RESEND_API_KEY`
- `VITE_BASE_URL`

## Rollback

If a deployment fails, Coolify keeps the old container running. To rollback manually:

1. Go to Coolify app settings
2. Find previous deployment
3. Click "Redeploy"

Or change the image tag to a specific commit:
```
ghcr.io/username/obrana-app:main-abc1234
```

## Cost

- **GitHub Actions**: Free for public repos (2000 minutes/month for private)
- **GHCR Storage**: Free for public packages, $0.25/GB for private
- **Coolify**: No extra cost, just pulls pre-built images

---

**Need help?** Check GitHub Actions logs and Coolify logs for errors.
