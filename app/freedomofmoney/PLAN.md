# Freedom of Money — 链上购书功能设计文档

**状态：** 待实施（缺两个链上参数）  
**最后更新：** 2026-04-11

---

## 缺失信息（开始前必须确认）

| # | 信息 | 说明 |
|---|---|---|
| 1 | **$U 合约完整地址** | 现有页面只有截断版 `0xcE244...6666`，需要完整 0x 地址 |
| 2 | **Treasury 收款钱包地址** | 用户付 $U 打到哪里，需要完整 0x 地址 |

---

## 页面结构

```
app/freedomofmoney/
├── page.tsx              ✅ 已有 — 活动介绍主页（已加 Order 按钮）
├── purchase/
│   └── page.tsx          ✅ 已有 — 待改造成三步流程
├── track/
│   └── page.tsx          ❌ 待建 — 公开查询页
├── admin/
│   └── page.tsx          ❌ 待建 — 内部后台
└── PLAN.md               📄 本文档

app/api/freedomofmoney/
├── purchase/
│   └── route.ts          ✅ 已有 — 保存订单（需加 tx_hash / wallet_address 字段）
├── order/
│   └── route.ts          ❌ 待建 — 公开查询接口
└── admin/
    └── route.ts          ❌ 待建 — 内部管理接口（需登录）
```

---

## 用户购书流程（三步）

### Step 1 — 连接钱包
- 用户点击"Connect Wallet"
- 弹出 MetaMask（或兼容 BNB Chain 的钱包）
- 连接后显示已连接地址（截断格式 `0xABCD...1234`）
- 网络自动检测，若不在 BNB Chain 上提示切换

### Step 2 — 链上付款
- 页面显示需支付金额（`BOOK_USD` 个 $U，当前约 13.46）
- 点"Pay X $U"，调用 $U 合约的 `transfer(treasury, amount)` 方法
- 钱包弹出确认交易
- 交易广播成功后返回 tx hash
- 页面大字显示 tx hash + 复制按钮 + **红色警告"请保存此 Hash，查询订单时需要用到"**

### Step 3 — 填写收货地址
- 钱包地址自动填入（只读，不可修改）
- Tx hash 自动带入（只读）
- 用户填写：姓名、Email、地址行1/2、城市、州/省、邮编、国家、备注
- 提交后存入数据库，显示成功页面

---

## 查询页 `/freedomofmoney/track`（公开）

- 一个输入框，接受 **tx hash** 或 **钱包地址**
- 按 tx hash 查：精确匹配，返回对应订单
- 按钱包地址查：返回该地址下所有订单列表
- 显示内容：
  - 订单状态（Pending / Ordered / Shipped / Delivered）
  - Amazon 物流单号（如有）
  - 下单时间
  - 不显示完整收货地址（隐私保护）

---

## 内部后台 `/freedomofmoney/admin`（需登录）

- 受现有 JWT 中间件保护
- 功能：
  - 列出所有订单（按时间倒序）
  - 筛选：按状态、按日期
  - 每条订单可以：
    - 修改状态（pending → ordered → shipped → delivered → cancelled）
    - 填写 Amazon 物流单号
  - 显示完整收货地址（供手动在 Amazon 下单用）
  - 显示对应的 tx hash（可点击跳转 BscScan 验证）

---

## 数据库改动

在现有 `book_orders` 表（已有 migration）基础上，需要加字段：

```sql
ALTER TABLE book_orders
  ADD COLUMN tx_hash      TEXT UNIQUE CHECK (tx_hash IS NULL OR tx_hash ~* '^0x[0-9a-f]{64}$'),
  ADD COLUMN wallet_address TEXT      CHECK (wallet_address IS NULL OR wallet_address ~* '^0x[0-9a-fA-F]{40}$'),
  ADD COLUMN amazon_tracking TEXT,
  ADD COLUMN amount_u     NUMERIC;   -- 实际支付的 $U 金额（从链上读）

CREATE INDEX idx_book_orders_tx_hash       ON book_orders(tx_hash);
CREATE INDEX idx_book_orders_wallet        ON book_orders(wallet_address);
```

---

## 新增依赖

```bash
npm install wagmi viem @wagmi/connectors
```

- **wagmi** — React hooks for wallet connection & transactions
- **viem** — BNB Chain 交互（读合约、发交易）
- **@wagmi/connectors** — MetaMask / WalletConnect 连接器

---

## 链上参数（待填入）

```ts
// app/freedomofmoney/lib/constants.ts（待建）

export const U_CONTRACT = '0x???'          // $U 合约地址（BNB Chain）
export const TREASURY   = '0x???'          // 收款钱包地址
export const BOOK_U_AMOUNT = 13_460000000000000000n  // 13.46 $U (18位精度)
export const BNB_CHAIN_ID  = 56
```

---

## 实施顺序（拿到链上参数后）

1. 建新 migration（加字段）
2. 安装 web3 依赖
3. 建 `app/freedomofmoney/lib/constants.ts`（填入合约地址）
4. 建 wagmi provider（接入 BNB Chain）
5. 改造 `purchase/page.tsx`（三步流程）
6. 建 `track/page.tsx` + 对应 API
7. 建 `admin/page.tsx` + 对应 API
8. 更新 `middleware.ts`（admin 走登录保护，track 公开）
