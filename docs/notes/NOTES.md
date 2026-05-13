# iRepair Project Notes

## Runtime Config Fix

May 12, 2026: The production error was caused by Zod validating server-only environment variables from a module that was also imported by client-side code, so those secrets were stripped in the browser and resolved to `undefined`. The fix was to split config validation into `src/lib/config/public.ts` for browser-safe values and `src/lib/config/server.ts` for secrets, then update imports so client bundles only reference public env vars.

## EC2 Instance

| | |
|---|---|
| **Instance ID** | `i-0b23ce9b2278772c4` |
| **Public IP** | `54.81.190.69` |
| **User** | `ubuntu` |
| **Key** | `irepair-dev-key.pem` (project root) |
| **Region** | `us-east-1` |

## Shell Aliases (in `~/.bashrc`)

| Alias | What it does |
|---|---|
| `irepair-ssh` | SSH into the EC2 instance |
| `irepair-start-ec2` | Start the EC2 instance (when stopped) |
| `irepair-update-ec2` | Rsync local project → EC2 |
| `irepair-dev-ec2` | Run `pnpm dev` on EC2 |
| `irepair-build-ec2` | Run `pnpm build` on EC2 |
| `irepair-update-run` | Rsync + install deps + `pnpm dev` in one shot |

> Run `source ~/.bashrc` to reload aliases after any changes.

## Dev Workflow

```
1. Make changes locally
2. irepair-update-run   ← sync + start dev server
   — or —
   irepair-update-ec2   ← sync only
   irepair-dev-ec2      ← start dev server separately
```

## Notes

- `.env.local` is excluded from rsync — manage environment variables on EC2 separately at `~/. env.local`
- `node_modules` and `.next` are excluded from rsync — deps are installed on EC2 via `pnpm install`
- The app runs on port 3000 by default; ensure port 3000 is open in the `irepair-dev-sg` security group to access it
- `.env.local` values are stored in the file itself (gitignored) — do not paste secrets into this file


















