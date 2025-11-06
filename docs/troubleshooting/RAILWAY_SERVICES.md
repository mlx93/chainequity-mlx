# Railway Services Configuration

## ✅ RESOLVED: Services Now in Same Project

**Indexer Service**: Project `superb-trust`
- Service name: `chainequity-mlx`
- GitHub repo: `chainequity-mlx`
- Auto-deploys from GitHub pushes
- **Status**: ✅ Running and connected to database

**PostgreSQL Database**: Project `superb-trust`
- Database service added to same project
- **Status**: ✅ Connected via internal networking
- Railway auto-provides `DATABASE_URL` variable
- Internal hostname (`postgres.railway.internal`) resolves correctly

## Resolution

✅ PostgreSQL moved to `superb-trust` project  
✅ Railway auto-provided `DATABASE_URL` to indexer  
✅ Internal DNS resolution working  
✅ Indexer successfully connected and running

## Important Notes

1. **Service names** (`superb-trust`, `lucid-strength`) are Railway's internal identifiers
2. **Project name** is what you see at the top of Railway dashboard
3. **Internal hostname** (`postgres.railway.internal`) only works when services are in same project
4. **DATABASE_URL** should be auto-provided by Railway when both services are linked

## Finding Services in Railway Dashboard

- Look for service cards named `superb-trust` (indexer) and `lucid-strength` (postgres)
- Both should be visible in the project's service list
- PostgreSQL service should show as "Database" type
- Indexer service should show GitHub integration

## Troubleshooting

If `DATABASE_URL` doesn't auto-populate:
1. Verify both services are in the same project
2. Check that PostgreSQL is added as a service (not external)
3. Manual set: Copy DATABASE_URL from PostgreSQL → Variables → to Indexer → Variables

