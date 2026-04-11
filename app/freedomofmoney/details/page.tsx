const GOLD     = '#A18B2F';
const BG       = '#F7F5F0';
const CARD     = '#FFFFFF';
const BORDER   = 'rgba(161,139,47,0.14)';
const TEXT      = '#1A1A1A';
const MUTED    = '#888';
const CONTRACT = '0xcE24439F2D9C6a2289F741120FE202248B666666';
const TREASURY = '0x7B72496CC89D82A31f1513D8F01973db70c3E85B';

function ULogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 64 / 58)} viewBox="0 0 58 64" fill="none">
      <path d="M37.5659 55.4667C26.4385 55.4667 17.3414 46.08 17.3414 35.1289V1.42222C17.3414 0.64 16.6911 0 15.8963 0H1.44512C0.650304 0 0 0.64 0 1.42222V35.0151C0 50.7591 13.0856 64.0924 29.0758 64C44.6109 63.9076 57.2268 51.7547 57.7759 36.5796C57.234 47.104 48.3899 55.4667 37.5659 55.4667Z" fill="url(#dg1)" />
      <path d="M56.3581 0H41.9069C41.1121 0 40.4618 0.64 40.4618 1.42222V35.2356C40.4618 41.3653 35.6784 46.6347 29.4572 46.9191C22.8169 47.2249 17.3398 42.0196 17.3398 35.5556C17.3398 46.5493 26.4007 55.4667 37.5715 55.4667C48.7423 55.4667 57.2324 47.104 57.7743 36.5796C57.7888 36.2382 57.8032 35.8969 57.8032 35.5556V1.42222C57.8032 0.64 57.1529 0 56.3581 0Z" fill="url(#dg2)" />
      <defs>
        <linearGradient id="dg1" x1="31" y1="63" x2="26" y2="2" gradientUnits="userSpaceOnUse"><stop stopColor="#E9D276" /><stop offset="1" stopColor="#A18B2F" /></linearGradient>
        <linearGradient id="dg2" x1="41" y1="52" x2="36" y2="3" gradientUnits="userSpaceOnUse"><stop stopColor="#9F9FA2" /><stop offset="1" stopColor="#D7D7D7" /></linearGradient>
      </defs>
    </svg>
  );
}

function SectionHead({ label, title }: { label: string; title: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 10, color: GOLD, letterSpacing: 3, textTransform: 'uppercase' as const, fontWeight: 700, marginBottom: 8 }}>{label}</div>
      <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -1, color: TEXT }}>{title}</h2>
    </div>
  );
}

function QA({ q, a }: { q: string; a: string }) {
  return (
    <div style={{ padding: '20px 0', borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 6 }}>{q}</div>
      <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.7 }}>{a}</div>
    </div>
  );
}

export default function DetailsPage() {
  return (
    <>
      <style>{`*, *::before, *::after { box-sizing: border-box; } body { margin: 0; background: ${BG}; }`}</style>
      <div style={{ background: BG, minHeight: '100vh', fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', color: TEXT }}>

        {/* NAV */}
        <nav style={{ padding: '14px 24px', display: 'flex', justifyContent: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0,0,0,0.06)', borderRadius: 50,
            padding: '9px 24px', display: 'flex', alignItems: 'center', gap: 20,
            maxWidth: 560, width: '100%',
          }}>
            <a href="https://u.tech/" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', marginRight: 'auto' }}>
              <ULogo size={20} />
              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>United Stables</span>
            </a>
            <a href="/freedomofmoney" style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>Campaign</a>
            <a href="/freedomofmoney/purchase" style={{
              padding: '7px 18px', borderRadius: 50, textDecoration: 'none',
              background: TEXT, color: '#fff', fontSize: 12, fontWeight: 700,
            }}>Order</a>
          </div>
        </nav>

        {/* HEADER */}
        <div style={{ textAlign: 'center', padding: '56px 24px 48px', maxWidth: 560, margin: '0 auto' }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, margin: '0 0 12px' }}>About This Campaign</h1>
          <p style={{ fontSize: 15, color: MUTED, margin: 0, lineHeight: 1.65 }}>
            What the book is, what $U is, and how this campaign works.
          </p>
        </div>

        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px 80px' }}>

          {/* ─── SECTION 1: THE BOOK ─────────────────────────────── */}
          <section style={{ marginBottom: 56 }}>
            <SectionHead label="The Book" title="What is Freedom of Money?" />
            <div style={{ fontSize: 15, color: '#444', lineHeight: 1.8 }}>
              <p style={{ margin: '0 0 16px' }}>
                <em>Freedom of Money</em> is the memoir of Changpeng Zhao (CZ), founder of Binance. Released on April 8, 2026, it reached #1 Bestseller on its first day.
              </p>
              <p style={{ margin: '0 0 16px' }}>
                The book covers CZ&apos;s journey from flipping burgers in Montreal to building the world&apos;s largest crypto exchange, his legal battles, and his vision for the future of money.
              </p>
              <p style={{ margin: 0 }}>
                100% of the book&apos;s proceeds are donated to charity by CZ himself. This campaign extends that mission by letting you purchase it with $U, keeping the entire flow transparent and on-chain.
              </p>
            </div>
          </section>

          <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${BORDER}, transparent)`, marginBottom: 56 }} />

          {/* ─── SECTION 2: $U ─────────────────────────────────── */}
          <section style={{ marginBottom: 56 }}>
            <SectionHead label="The Stablecoin" title="What is $U?" />
            <div style={{ fontSize: 15, color: '#444', lineHeight: 1.8 }}>
              <p style={{ margin: '0 0 16px' }}>
                $U is a USD-pegged stablecoin issued by <a href="https://u.tech" target="_blank" rel="noreferrer" style={{ color: GOLD, textDecoration: 'none', fontWeight: 600 }}>United Stables Limited (BVI)</a>. 1 $U = 1 USD.
              </p>
              <p style={{ margin: '0 0 16px' }}>
                Reserve assets are held through a dedicated trust arrangement operated by Wallets Trust Limited, a registered trustee, ensuring full legal segregation from corporate assets.
              </p>
              <p style={{ margin: '0 0 16px' }}>
                $U is deployed on BNB Chain. It has been audited by PeckShield (Report #2025-157) with zero Critical or High findings.
              </p>
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '14px 18px', fontSize: 13, fontFamily: 'monospace', color: TEXT }}>
                Contract: {CONTRACT}
              </div>
            </div>
          </section>

          <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${BORDER}, transparent)`, marginBottom: 56 }} />

          {/* ─── SECTION 3: HOW IT WORKS ──────────────────────── */}
          <section style={{ marginBottom: 56 }}>
            <SectionHead label="The Process" title="How It Works" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { n: '1', title: 'Connect wallet', desc: 'Any BNB Chain compatible wallet (MetaMask, etc.).' },
                { n: '2', title: 'Enter shipping address', desc: 'Your country determines which Amazon marketplace we order from.' },
                { n: '3', title: 'Swap to $U if needed', desc: 'PancakeSwap converts BNB, USDT, USDC, or any token to $U in one click.' },
                { n: '4', title: 'Pay with $U', desc: 'A standard ERC-20 transfer to the Treasury address. No custom smart contracts.' },
                { n: '5', title: 'We ship your book', desc: 'Purchased from Amazon, shipped to your door. Track status with your tx hash.' },
              ].map(({ n, title, desc }, i) => (
                <div key={n} style={{ display: 'flex', gap: 16, padding: '20px 0', borderBottom: i < 4 ? `1px solid ${BORDER}` : 'none' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: CARD, border: `1.5px solid ${GOLD}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, color: GOLD,
                  }}>{n}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 3 }}>{title}</div>
                    <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${BORDER}, transparent)`, marginBottom: 56 }} />

          {/* ─── SECTION 4: FUND TRANSPARENCY ─────────────────── */}
          <section style={{ marginBottom: 56 }}>
            <SectionHead label="Transparency" title="Where Your Money Goes" />
            <div style={{ fontSize: 15, color: '#444', lineHeight: 1.8, marginBottom: 20 }}>
              <p style={{ margin: '0 0 16px' }}>
                100% of your $U payment goes to the Treasury wallet. From there, it is donated to charity. The Treasury is a standard BSC wallet with no executable logic and zero attack surface.
              </p>
              <p style={{ margin: 0 }}>
                Every inbound payment and every outbound donation is permanently recorded on BNB Chain and publicly visible.
              </p>
            </div>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1.5, textTransform: 'uppercase' as const, marginBottom: 4 }}>Treasury</div>
                <div style={{ fontSize: 12, fontFamily: 'monospace', color: TEXT }}>{TREASURY}</div>
              </div>
              <a href={`https://bscscan.com/address/${TREASURY}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, padding: '7px 16px', border: `1px solid ${BORDER}`, borderRadius: 50, color: GOLD, textDecoration: 'none', fontWeight: 600 }}>
                BscScan ↗
              </a>
            </div>
          </section>

          <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${BORDER}, transparent)`, marginBottom: 56 }} />

          {/* ─── SECTION 5: FAQ ────────────────────────────────── */}
          <section style={{ marginBottom: 56 }}>
            <SectionHead label="FAQ" title="Common Questions" />
            <div>
              <QA
                q="Is this safe?"
                a="No custom smart contracts are involved. The only on-chain action is a standard ERC-20 transfer() call. $U is audited by PeckShield with zero Critical/High findings. The Treasury is a plain wallet with no executable code."
              />
              <QA
                q="What tokens can I pay with?"
                a="Any token on BNB Chain or Ethereum. PancakeSwap handles the conversion to $U automatically before payment."
              />
              <QA
                q="How long does shipping take?"
                a="We purchase the book from Amazon after confirming your on-chain payment. Typical delivery is 3-7 business days depending on your region."
              />
              <QA
                q="Which countries can you ship to?"
                a="Most countries worldwide. Certain restricted regions (China mainland, North Korea, Iran, Syria, Cuba) cannot be fulfilled. The checkout page will notify you if your destination is restricted."
              />
              <QA
                q="How do I track my order?"
                a="Use your transaction hash or wallet address at /freedomofmoney/track. Your order status updates as we process, ship, and deliver."
              />
              <QA
                q="What if my payment succeeds but the order fails?"
                a="The system is designed to be idempotent. If there is a network issue, you can retry with the same transaction hash and it will recover your existing order."
              />
              <QA
                q="How is pricing determined?"
                a="The book price is based on the Amazon listing for your shipping region. $U is pegged 1:1 to USD. The price is locked at checkout."
              />
            </div>
          </section>

        </div>

        {/* FOOTER */}
        <footer style={{ borderTop: `1px solid ${BORDER}`, padding: '32px 24px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <a href="https://u.tech/" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
              <ULogo size={18} />
              <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>United Stables</span>
            </a>
            <div style={{ display: 'flex', gap: 16, fontSize: 11, color: MUTED }}>
              <a href="/freedomofmoney" style={{ color: MUTED, textDecoration: 'none' }}>Campaign</a>
              <a href="/freedomofmoney/track" style={{ color: MUTED, textDecoration: 'none' }}>Track Order</a>
              <a href="https://u.tech/" target="_blank" rel="noreferrer" style={{ color: MUTED, textDecoration: 'none' }}>u.tech ↗</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
