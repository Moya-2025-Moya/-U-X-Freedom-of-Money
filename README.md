# Freedom of Money x $U

Source code for the **Freedom of Money** campaign by [United Stables](https://u.tech).

**Live:** [ustables.tech/freedomofmoney](https://ustables.tech/freedomofmoney)

## What this is

Buy CZ's memoir *Freedom of Money* with $U. 100% of proceeds go to charity, verifiable on-chain.

## On-chain (BNB Chain)

| | Address |
|---|---|
| **$U Contract** | `0xcE24439F2D9C6a2289F741120FE202248B666666` |
| **Treasury** | `0x7B72496CC89D82A31f1513D8F01973db70c3E85B` |

Audit: PeckShield #2025-157. All payments visible on [BscScan](https://bscscan.com/address/0x7B72496CC89D82A31f1513D8F01973db70c3E85B).

## How it works

1. Connect a BNB Chain wallet
2. Enter shipping address (determines regional pricing)
3. Swap any token to $U via PancakeSwap if needed
4. Pay $U to treasury. Transaction hash recorded on-chain
5. Book is purchased from Amazon and shipped
6. Track order at `/freedomofmoney/track` using tx hash or wallet

## Security

- On-chain payment verification (Transfer event parsing, amount check, sender validation)
- Duplicate tx hash prevention (DB unique constraint + pre-check)
- Rate limiting per email (60s cooldown via DB function)
- Row Level Security on all tables (service_role only)
- Admin routes protected by JWT auth
- Country/region restriction enforcement on both frontend and backend
- RPC keys stored in environment variables, not in client code

## Code structure

```
app/freedomofmoney/
  page.tsx              Landing page (server component, ISR 60s)
  purchase/page.tsx     3-step flow: wallet > address > pay
  track/page.tsx        Public order lookup
  details/page.tsx      Campaign FAQ
  admin/page.tsx        Internal order management (auth required)
  lib/
    constants.ts        Contract addresses, pricing, ABI
    wagmi-config.ts     BNB Chain wallet config
    SwapWidget.tsx      PancakeSwap redirect widget

app/api/freedomofmoney/
  purchase/route.ts     POST - submit order (on-chain verified)
  order/route.ts        GET  - public status lookup
  admin/route.ts        GET/PATCH - order management (auth required)
```

## Tech stack

- Next.js, React 19, TypeScript
- wagmi v2, viem v2, BNB Chain (BSC)
- PancakeSwap (StableSwap routing)
- Supabase (Postgres + RLS)
- Vercel
