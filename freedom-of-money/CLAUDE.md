# Freedom of Money - Standalone Project

## Overview

链上购书活动：用 $U 稳定币购买 CZ 的回忆录《Freedom of Money》，100% 善款，全链上可验证。

## Quick Setup (for Claude Code)

```bash
# 1. 安装依赖
npm install

# 2. 复制环境变量并填写
cp .env.example .env.local
# 然后编辑 .env.local 填入实际值

# 3. 初始化数据库（需要 Supabase CLI）
# 如果还没装: npm install -g supabase
supabase db push
# 或者手动在 Supabase Dashboard SQL Editor 中执行:
#   supabase/migrations/20260410000000_book_orders.sql
#   supabase/migrations/20260411000000_book_orders_web3_fields.sql

# 4. 启动开发服务器
npm run dev
```

## Tech Stack

- **Framework:** Next.js 16 + React 19 + TypeScript
- **Blockchain:** BNB Chain (BSC), wagmi v3, viem v2
- **Database:** Supabase (Postgres + RLS)
- **Auth:** JWT (jose) + API key for admin
- **Swap:** Paraswap API v5 (routes through PancakeSwap)
- **Deploy:** Vercel

## Project Structure

```
app/
  freedomofmoney/
    page.tsx              # Landing page (SSR, ISR 60s)
    purchase/page.tsx     # 3-step checkout: wallet > address > pay
    track/page.tsx        # Public order lookup by tx hash / wallet
    details/page.tsx      # Campaign info & FAQ
    admin/page.tsx        # Order management (auth required)
    lib/
      constants.ts        # Contract addresses, pricing, ERC-20 ABI
      wagmi-config.ts     # BNB Chain wallet config
      SwapWidget.tsx      # Token swap widget (Paraswap)
  api/freedomofmoney/
    purchase/route.ts     # POST - create order (on-chain verified)
    order/route.ts        # GET - public order lookup
    admin/route.ts        # GET/PATCH - admin order management
  lib/
    supabase-server.ts    # Supabase admin client (service_role)
middleware.ts             # Auth middleware (admin routes protected)
```

## Key Constants (BNB Chain)

| Item | Value |
|------|-------|
| $U Contract | `0xcE24439F2D9C6a2289F741120FE202248B666666` |
| Treasury | `0x7B72496CC89D82A31f1513D8F01973db70c3E85B` |
| Book Price | 22 $U |
| Chain | BNB Chain (ID 56) |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `BSC_RPC_URL` | Yes | BNB Chain RPC for server-side tx verification |
| `BD_ENGINE_JWT_SECRET` | Yes | JWT secret (>= 16 chars) for admin auth |
| `BD_ENGINE_API_KEY` | Yes | API key for admin endpoints |

## Database

两个 migration 文件在 `supabase/migrations/`：
1. `20260410000000_book_orders.sql` - 建表 + RLS + rate limit function
2. `20260411000000_book_orders_web3_fields.sql` - 加 tx_hash, wallet_address, amazon_tracking, amount_u

表名：`book_orders`，只有 service_role 有权限（RLS）。

## Route Auth Rules

- **Public (no auth):** `/freedomofmoney`, `/freedomofmoney/purchase`, `/freedomofmoney/track`, `/freedomofmoney/details`, `/api/freedomofmoney/purchase`, `/api/freedomofmoney/order`
- **Protected (JWT/API key):** `/freedomofmoney/admin`, `/api/freedomofmoney/admin`

## Development Notes

- Landing page uses ISR (revalidate = 60s), reads on-chain balance + DB order count
- Purchase flow: connect wallet -> fill address -> pay $U (ERC-20 transfer) -> auto-submit order to API
- API verifies payment on-chain by parsing Transfer event logs from tx receipt
- Duplicate tx hash prevented at both API level (pre-check) and DB level (unique constraint)
- Rate limit: 60s cooldown per email via DB function `check_book_order_rate_limit`
- SwapWidget uses Paraswap API for USDT/USDC -> $U swaps on BNB Chain
- Admin panel uses SWR with 30s polling

## Deployment (Vercel)

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel

# Set env vars
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add BSC_RPC_URL
vercel env add BD_ENGINE_JWT_SECRET
vercel env add BD_ENGINE_API_KEY
```

## Public Assets

- `public/book-cover.png` - Book cover image used on landing page

## GitHub Sync Workflow

`.github/workflows/sync-freedomofmoney.yml` syncs code to public repo `Moya-2025-Moya/-U-X-Freedom-of-Money`. Requires `PUBLIC_REPO_PAT` secret.
