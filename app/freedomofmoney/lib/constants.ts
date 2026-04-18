// ─── Chain constants ──────────────────────────────────────────────────────────
export const BNB_CHAIN_ID = 56;

// $U token contract on BNB Chain
export const U_CONTRACT = '0xcE24439F2D9C6a2289F741120FE202248B666666' as `0x${string}`;

export const TREASURY = '0x7B72496CC89D82A31f1513D8F01973db70c3E85B' as `0x${string}`;

// Book price in $U (18 decimals).
// Paperback £10.39 + shipping £5.84 = £16.23, at GBP/USD ~1.30 = ~$21.
// Rounded to $22 to cover FX fluctuations and regional shipping variance.
export const BOOK_USD = 22;
// BigInt representation for on-chain transfer (18 decimals)
export const BOOK_U_AMOUNT = BigInt(BOOK_USD) * BigInt(10) ** BigInt(18);

// Minimal ERC-20 ABI - only what we need
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

// Shared with server-side validator — keep in sync with api/purchase route
export const RESTRICTED_COUNTRIES_DISPLAY = [
  'China (mainland)', 'North Korea', 'Iran', 'Syria', 'Cuba', 'Crimea',
] as const;

export const RESTRICTED_PATTERNS = [
  'china', 'mainland china', 'prc', "people's republic of china",
  '中国', '中华人民共和国',
  'north korea', 'dprk', 'korea, democratic',
  'iran', 'syria', 'cuba', 'crimea',
] as const;

export function isRestrictedCountry(country: string): boolean {
  const c = country.trim().toLowerCase();
  return RESTRICTED_PATTERNS.some(p => c === p || c.includes(p));
}

// ISO-expanded country list with ISO-3166-1 codes (for better autofill + datalist search)
export const COUNTRIES: { name: string; code: string }[] = [
  { name: 'Argentina', code: 'AR' }, { name: 'Australia', code: 'AU' }, { name: 'Austria', code: 'AT' },
  { name: 'Bangladesh', code: 'BD' }, { name: 'Belgium', code: 'BE' }, { name: 'Brazil', code: 'BR' },
  { name: 'Bulgaria', code: 'BG' }, { name: 'Canada', code: 'CA' }, { name: 'Chile', code: 'CL' },
  { name: 'Colombia', code: 'CO' }, { name: 'Croatia', code: 'HR' }, { name: 'Czech Republic', code: 'CZ' },
  { name: 'Denmark', code: 'DK' }, { name: 'Egypt', code: 'EG' }, { name: 'Estonia', code: 'EE' },
  { name: 'Finland', code: 'FI' }, { name: 'France', code: 'FR' }, { name: 'Germany', code: 'DE' },
  { name: 'Greece', code: 'GR' }, { name: 'Hong Kong', code: 'HK' }, { name: 'Hungary', code: 'HU' },
  { name: 'Iceland', code: 'IS' }, { name: 'India', code: 'IN' }, { name: 'Indonesia', code: 'ID' },
  { name: 'Ireland', code: 'IE' }, { name: 'Israel', code: 'IL' }, { name: 'Italy', code: 'IT' },
  { name: 'Japan', code: 'JP' }, { name: 'Kenya', code: 'KE' }, { name: 'Latvia', code: 'LV' },
  { name: 'Lithuania', code: 'LT' }, { name: 'Luxembourg', code: 'LU' }, { name: 'Macau', code: 'MO' },
  { name: 'Malaysia', code: 'MY' }, { name: 'Mexico', code: 'MX' }, { name: 'Morocco', code: 'MA' },
  { name: 'Netherlands', code: 'NL' }, { name: 'New Zealand', code: 'NZ' }, { name: 'Nigeria', code: 'NG' },
  { name: 'Norway', code: 'NO' }, { name: 'Pakistan', code: 'PK' }, { name: 'Peru', code: 'PE' },
  { name: 'Philippines', code: 'PH' }, { name: 'Poland', code: 'PL' }, { name: 'Portugal', code: 'PT' },
  { name: 'Qatar', code: 'QA' }, { name: 'Romania', code: 'RO' }, { name: 'Saudi Arabia', code: 'SA' },
  { name: 'Serbia', code: 'RS' }, { name: 'Singapore', code: 'SG' }, { name: 'Slovakia', code: 'SK' },
  { name: 'Slovenia', code: 'SI' }, { name: 'South Africa', code: 'ZA' }, { name: 'South Korea', code: 'KR' },
  { name: 'Spain', code: 'ES' }, { name: 'Sweden', code: 'SE' }, { name: 'Switzerland', code: 'CH' },
  { name: 'Taiwan', code: 'TW' }, { name: 'Thailand', code: 'TH' }, { name: 'Turkey', code: 'TR' },
  { name: 'UAE', code: 'AE' }, { name: 'Ukraine', code: 'UA' }, { name: 'United Kingdom', code: 'GB' },
  { name: 'United States', code: 'US' }, { name: 'Uruguay', code: 'UY' }, { name: 'Vietnam', code: 'VN' },
];
