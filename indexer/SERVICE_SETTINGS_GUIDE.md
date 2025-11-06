# Finding Railway Service Settings for Root Directory

## Problem
You're looking at **Project Settings**, but you need **Service Settings** to configure root directory.

## Step-by-Step Navigation

### Step 1: Navigate from Project to Service

1. You're currently at: **Project Settings** → General tab
2. Close the Project Settings modal (click X)
3. You should now see your **Project Dashboard** showing:
   - Service cards (e.g., "Indexer", "PostgreSQL", etc.)
   - Or a list of services
4. **Click directly on your Indexer service card/name**

### Step 2: Access Service Settings

After clicking the Indexer service, you should see:
- Service Overview page
- Tabs at the top: **Deployments**, **Metrics**, **Logs**, **Settings**, etc.
- Click **Settings** tab

### Step 3: Find Root Directory

In Service Settings, look for:
- **Source** section (usually near top)
- **Root Directory** field within Source section
- If not there, check **General** section in Service Settings

## Alternative: If Root Directory Field Not Visible

If you still don't see Root Directory after navigating to Service Settings, Railway may require you to set it during GitHub connection setup:

### Option 1: Disconnect and Reconnect GitHub

1. In **Service Settings** → **Source** section
2. Find **GitHub** connection/disconnect option
3. Click **Disconnect** (if available)
4. Click **Connect GitHub**
5. When prompted, **specify root directory as `indexer`** during setup

### Option 2: Use Environment Variable Workaround

If Root Directory option doesn't exist, set this environment variable:

1. In **Service Settings** → **Variables** tab
2. Add new variable:
   - Name: `RAILWAY_DOCKERFILE_PATH`
   - Value: `Dockerfile`
3. Save

### Option 3: Use Railway CLI

```bash
cd indexer
railway link  # Link to your service
# Then try setting root directory via CLI commands
railway variables set RAILWAY_DOCKERFILE_PATH=Dockerfile
```

## Visual Guide

```
Railway Dashboard
├── Project: "superb-trust"
│   ├── Service: "Indexer" ← CLICK HERE
│   │   └── Settings → Source → Root Directory ← CONFIGURE HERE
│   └── Service: "PostgreSQL"
└── Project Settings ← You were here (wrong level!)
```

## Still Can't Find It?

The Root Directory field may be hidden if:
- Your Railway plan doesn't support it (unlikely)
- Service was created differently
- Railway UI changed

In that case, use the **environment variable workaround** (`RAILWAY_DOCKERFILE_PATH=Dockerfile`) or contact Railway support.


