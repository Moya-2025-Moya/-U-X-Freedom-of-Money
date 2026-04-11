// ─── Chain constants ──────────────────────────────────────────────────────────
export const BNB_CHAIN_ID = 56;

// $U token contract on BNB Chain
export const U_CONTRACT = '0xcE24439F2D9C6a2289F741120FE202248B666666' as `0x${string}`;

export const TREASURY = '0x7B72496CC89D82A31f1513D8F01973db70c3E85B' as `0x${string}`;

// Book price in $U (18 decimals). $U is pegged at $1, book is ~$13.46.
export const BOOK_GBP = 10.39;
export const GBP_USD  = 1.296;
export const BOOK_USD = +(BOOK_GBP * GBP_USD).toFixed(2);
// BigInt representation for on-chain transfer (18 decimals)
export const BOOK_U_AMOUNT = BigInt(Math.round(BOOK_USD * 1e6)) * BigInt(10) ** BigInt(12);

// Minimal ERC-20 ABI — only what we need
export const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to',     type: 'address' },
      { name: 'value',  type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;

// BscScan tx link helper
export const bscscanTx = (hash: string) =>
  `https://bscscan.com/tx/${hash}`;
