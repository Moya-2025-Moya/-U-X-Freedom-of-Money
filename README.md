# Freedom of Money × $U — Open Source Code

This repository contains the source code for the **Freedom of Money** campaign by [United Stables](https://ustables.tech).

**Live site:** https://ustables.tech/freedomofmoney

---

## What this is

A campaign to purchase CZ's memoir *Freedom of Money* using $U (United Stables' stablecoin on BNB Chain). Users pay in $U, receive a physical copy shipped to their door, and 100% of proceeds go to charity — verifiable on-chain.

---

## On-chain addresses (BNB Chain)

| | Address |
|---|---|
| **$U Contract** | `0xcE24439F2D9C6a2289F741120FE202248B666666` |
| **Treasury** | `0x7B72496CC89D82A31f1513D8F01973db70c3E85B` |

- $U audit: PeckShield Report #2025-157
- All inbound payments and charity outflows are publicly visible on [BscScan](https://bscscan.com/address/0x7B72496CC89D82A31f1513D8F01973db70c3E85B)

---

## Code structure

```
app/freedomofmoney/
├── page.tsx          # Campaign landing page
├── purchase/         # 3-step purchase flow (wallet → pay $U → shipping address)
├── track/            # Public order tracking (by tx hash or wallet address)
└── lib/
    ├── constants.ts  # Contract addresses, book price, ERC-20 ABI
    ├── wagmi-config.ts  # BNB Chain wallet config
    └── SwapWidget.tsx   # In-page PancakeSwap swap (any token → $U)

app/api/freedomofmoney/
├── purchase/         # POST — saves shipping address + tx hash
├── order/            # GET  — public order status lookup
└── admin/            # PATCH — internal order management (auth required)
```

---

## How it works

1. User connects a BNB Chain wallet (MetaMask or compatible)
2. If they don't hold $U, an in-page swap via PancakeSwap V3 converts any token to $U
3. User sends exactly `BOOK_USD` $U to the treasury address — transaction hash recorded
4. User submits their shipping address, linked to the tx hash on-chain
5. We purchase the book from Amazon and ship it to their door
6. Order status is publicly trackable at `/freedomofmoney/track` using tx hash or wallet address

---

## Tech stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Wallet / Chain:** wagmi v3, viem, BNB Chain (BSC mainnet)
- **Swap:** PancakeSwap V3 Router (`0x13f4EA83D0bd40E75C8222255bc855a974568Dd4`)
- **Database:** Supabase (order storage, Row Level Security enforced)
- **Deployment:** Vercel
