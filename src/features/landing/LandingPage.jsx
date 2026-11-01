import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Store, ShieldCheck, BarChart3, ArrowRight, CheckCircle2, Monitor, Box, Users,
  Zap, Star, Menu, X, ChevronDown, Receipt, CreditCard, Smartphone, WifiOff,
  Printer, Clock, TrendingUp, Quote, Sparkles, Play, Building2, Barcode, Bell,
} from 'lucide-react';

const NAV = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Reviews', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
];

const STATS = [
  { value: '5,000+', label: 'Active stores' },
  { value: '12M+', label: 'Transactions / month' },
  { value: '99.99%', label: 'Uptime guaranteed' },
  { value: '40+', label: 'Countries served' },
];

const FEATURES = [
  { icon: Receipt, title: 'Lightning-fast Checkout', desc: 'Scan, tap, done. Barcode, split payments, discounts and returns in under 3 seconds per sale.', color: 'teal', span: 'md:col-span-2' },
  { icon: Box, title: 'Smart Inventory', desc: 'Live stock across every branch with low-stock alerts and automatic stock transfers.', color: 'amber', span: '' },
  { icon: Users, title: 'HR & Payroll', desc: 'Shifts, Clock In/Out, attendance and auto-calculated salaries — all in one place.', color: 'sky', span: '' },
  { icon: BarChart3, title: 'Advanced Analytics', desc: 'Profit margins, top products, peak hours and branch comparison in beautiful dashboards.', color: 'violet', span: 'md:col-span-2' },
  { icon: WifiOff, title: 'Works Offline', desc: 'Internet gone? Keep selling. Everything syncs automatically when you are back online.', color: 'rose', span: '' },
  { icon: Building2, title: 'Multi-Branch Control', desc: 'Manage unlimited outlets, warehouses and managers from a single login.', color: 'emerald', span: '' },
];

const COLORS = {
  teal: 'bg-teal-100 text-teal-700',
  amber: 'bg-amber-100 text-amber-700',
  sky: 'bg-sky-100 text-sky-700',
  violet: 'bg-violet-100 text-violet-700',
  rose: 'bg-rose-100 text-rose-700',
  emerald: 'bg-emerald-100 text-emerald-700',
};

const STEPS = [
  { n: '01', title: 'Create your account', desc: 'Sign up in 60 seconds. No credit card, no setup fee.' },
  { n: '02', title: 'Add products & branches', desc: 'Import your catalogue from Excel or add items by scanning barcodes.' },
  { n: '03', title: 'Start selling & growing', desc: 'Take payments, track staff and watch live reports roll in.' },
];

const HARDWARE = [
  { icon: Printer, label: 'Receipt Printers' },
  { icon: Barcode, label: 'Barcode Scanners' },
  { icon: CreditCard, label: 'Card Terminals' },
  { icon: Smartphone, label: 'Tablets & Phones' },
  { icon: Monitor, label: 'Desktop & Touch POS' },
];

const PLANS = [
  { name: 'Basic', tag: 'For single stores', price: 29, features: ['1 Branch', 'Basic Reports', 'Barcode Scanning', 'Email Support'], cta: 'Start Free', popular: false },
  { name: 'Pro', tag: 'For growing businesses', price: 79, features: ['5 Branches', 'Advanced Analytics', 'HR & Payroll', 'Offline Mode', '24/7 Priority Support'], cta: 'Start Free', popular: true },
  { name: 'Enterprise', tag: 'For large chains', price: 149, features: ['Unlimited Branches', 'Custom Reports', 'API Access', 'Dedicated Manager', 'Custom Integrations'], cta: 'Contact Sales', popular: false },
];

const REVIEWS = [
  { name: 'Ayesha Khan', role: 'Owner, FreshMart (6 branches)', text: 'We closed our books in minutes instead of days. Multi-branch stock transfer alone saved us hours every week.' },
  { name: 'Daniel Moore', role: 'Ops Manager, UrbanBrew Cafés', text: 'Payroll and shift tracking were a nightmare in spreadsheets. POSFlow made it automatic. Our team loves it.' },
  { name: 'Sara Ahmed', role: 'Founder, StyleHub Boutique', text: 'The analytics showed me which products actually make profit. Revenue is up 32% in just 4 months.' },
];

const FAQS = [
  { q: 'Is there really a free trial?', a: 'Yes. You get a 14-day free trial of the Pro plan with every feature unlocked. No credit card required.' },
  { q: 'Can I manage multiple branches from one account?', a: 'Absolutely. Basic covers 1 branch, Pro up to 5, and Enterprise supports unlimited branches with role-based access for each manager.' },
  { q: 'Does it work without internet?', a: 'Yes. POSFlow keeps selling in offline mode and syncs all sales and stock changes automatically once you reconnect.' },
  { q: 'Which hardware is supported?', a: 'Most USB/Bluetooth barcode scanners, thermal receipt printers, cash drawers and card terminals work out of the box, on desktop, tablet or phone.' },
  { q: 'Is my data safe?', a: 'Your data is encrypted in transit and at rest, backed up daily, and hosted on enterprise-grade cloud infrastructure.' },
  { q: 'Can I migrate from my old POS?', a: 'Yes. Import products, customers and suppliers from Excel/CSV, and our team will help you move over for free on Pro and Enterprise.' },
  { q: 'Can I cancel anytime?', a: 'Yes. There are no contracts or hidden fees. Cancel with one click and export all your data.' },
];

const Container = ({ children, className = '' }) => (
  <div className={`max-w-7xl mx-auto px-6 ${className}`}>{children}</div>
);

const SectionHead = ({ eyebrow, title, desc }) => (
  <div className="text-center max-w-2xl mx-auto mb-14">
    <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full mb-4">{eyebrow}</span>
    <h2 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight mb-4">{title}</h2>
    <p className="text-stone-500 font-medium leading-relaxed">{desc}</p>
  </div>
);

const FaqItem = ({ q, a, open, onClick }) => (
  <div className={`rounded-2xl border transition ${open ? 'bg-white border-teal-200 shadow-lg shadow-teal-900/5' : 'bg-white/60 border-stone-200 hover:bg-white'}`}>
    <button onClick={onClick} className="w-full flex items-center justify-between gap-4 text-left px-6 py-5">
      <span className="font-bold text-stone-900">{q}</span>
      <ChevronDown size={20} className={`shrink-0 text-teal-700 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
      <div className="overflow-hidden">
        <p className="px-6 pb-5 text-stone-500 leading-relaxed">{a}</p>
      </div>
    </div>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const price = (p) => (yearly ? Math.round(p * 0.8) : p);

  // ✅ Demo login function
  const goToDemo = () => {
    setIsMenuOpen(false);
    navigate('/login?demo=true');
  };

  return (
    <div className="posflow-landing min-h-screen bg-[#fbf8f2] text-stone-900 font-sans selection:bg-teal-200 overflow-x-hidden">
      <style>{`
        @keyframes floaty { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .floaty { animation: floaty 5s ease-in-out infinite; }
        .floaty-slow { animation: floaty 7s ease-in-out infinite; }
        .marquee { animation: marquee 30s linear infinite; }
        html { scroll-behavior: smooth; }

        /* Responsive layout refinements */
        .posflow-landing { width: 100%; min-width: 0; }
        .posflow-landing *, .posflow-landing *::before, .posflow-landing *::after { box-sizing: border-box; }
        .posflow-landing img, .posflow-landing svg { max-width: 100%; }
        .posflow-landing section[id], .posflow-landing header[id] { scroll-margin-top: 96px; }
        .posflow-landing .max-w-7xl { width: 100%; }
        .posflow-landing button, .posflow-landing a { -webkit-tap-highlight-color: transparent; }
        .posflow-landing button { touch-action: manipulation; }

        @media (min-width: 1536px) {
          .posflow-landing .max-w-7xl { max-width: 1320px; }
        }

        @media (max-width: 1023px) {
          .posflow-landing header.relative { padding-top: 128px; padding-bottom: 72px; }
          .posflow-landing header .gap-16 { gap: 3rem; }
          .posflow-landing section.py-24 { padding-top: 5rem; padding-bottom: 5rem; }
          .posflow-landing section.py-20 { padding-top: 4.5rem; padding-bottom: 4.5rem; }
          .posflow-landing .floaty { left: 0.5rem; }
          .posflow-landing .floaty-slow { right: 0.5rem; }
        }

        @media (max-width: 767px) {
          .posflow-landing .max-w-7xl { padding-left: 1.25rem; padding-right: 1.25rem; }
          .posflow-landing nav .max-w-7xl { padding-top: 0.75rem; padding-bottom: 0.75rem; }
          .posflow-landing header.relative { padding-top: 112px; padding-bottom: 3.5rem; }
          .posflow-landing header h1 { font-size: clamp(2.35rem, 9vw, 3.6rem); line-height: 1.08; overflow-wrap: anywhere; }
          .posflow-landing header p { font-size: 1rem; }
          .posflow-landing header .max-w-2xl { max-width: 100%; }
          .posflow-landing header .rounded-3xl { border-radius: 1.25rem; }
          .posflow-landing header .p-6 { padding: 1rem; }
          .posflow-landing header .grid-cols-3 { gap: 0.5rem; }
          .posflow-landing header .grid-cols-3 > div { min-width: 0; padding: 0.65rem; }
          .posflow-landing header .grid-cols-3 > div p:last-of-type { font-size: 1.1rem; }
          .posflow-landing header .h-40 { height: 8rem; }
          .posflow-landing header .floaty,
          .posflow-landing header .floaty-slow { display: none; }
          .posflow-landing section.py-16 { padding-top: 3rem; padding-bottom: 3rem; }
          .posflow-landing section.py-20,
          .posflow-landing section.py-24 { padding-top: 3.5rem; padding-bottom: 3.5rem; }
          .posflow-landing .mb-14 { margin-bottom: 2rem; }
          .posflow-landing h2 { overflow-wrap: break-word; }
          .posflow-landing .text-3xl { font-size: clamp(1.65rem, 6vw, 2rem); line-height: 1.2; }
          .posflow-landing .text-4xl { font-size: clamp(1.9rem, 7vw, 2.35rem); line-height: 1.15; }
          .posflow-landing .p-8 { padding: 1.35rem; }
          .posflow-landing .rounded-3xl { border-radius: 1.35rem; }
          .posflow-landing #pricing [class~="md:-translate-y-4"] { transform: none; }
          .posflow-landing #pricing .text-5xl { font-size: 2.6rem; }
          .posflow-landing #pricing [class*="MOST POPULAR"] { right: 1rem; }
          .posflow-landing footer .gap-6 { gap: 1rem; }
          .posflow-landing footer .flex { flex-wrap: wrap; }
          .posflow-landing footer p { text-align: center; }
        }

        @media (max-width: 480px) {
          .posflow-landing .max-w-7xl { padding-left: 1rem; padding-right: 1rem; }
          .posflow-landing nav a.text-2xl { font-size: 1.25rem; }
          .posflow-landing nav a.text-2xl span { width: 2.25rem; height: 2.25rem; }
          .posflow-landing nav [class~="lg:hidden"] + div { padding-left: 1rem; padding-right: 1rem; }
          .posflow-landing header .inline-flex.rounded-full { max-width: 100%; white-space: normal; justify-content: center; text-align: center; }
          .posflow-landing header h1 { font-size: clamp(2.1rem, 10vw, 2.8rem); }
          .posflow-landing header .flex-wrap { column-gap: 0.85rem; }
          .posflow-landing header .grid-cols-3 > div p:first-child { font-size: 0.62rem; }
          .posflow-landing header .grid-cols-3 > div p:last-of-type { font-size: 1rem; }
          .posflow-landing #pricing .flex.items-center.justify-center { gap: 0.6rem; }
          .posflow-landing #pricing .text-xs { font-size: 0.68rem; }
          .posflow-landing #faq button { padding: 1rem; }
          .posflow-landing #faq button span:first-child { font-size: 0.9rem; }
          .posflow-landing #faq p { padding-left: 1rem; padding-right: 1rem; }
          .posflow-landing section.pb-24 { padding-bottom: 3rem; }
          .posflow-landing section.pb-24 [class*="rounded-[2.5rem]"] { border-radius: 1.5rem; padding: 2.5rem 1.25rem; }
          .posflow-landing footer .max-w-7xl { gap: 1.25rem; }
        }

        @media (max-width: 360px) {
          .posflow-landing .max-w-7xl { padding-left: 0.85rem; padding-right: 0.85rem; }
          .posflow-landing header h1 { font-size: 2rem; }
          .posflow-landing header .grid-cols-3 { gap: 0.35rem; }
          .posflow-landing header .grid-cols-3 > div { padding: 0.5rem; }
          .posflow-landing header .grid-cols-3 > div p:last-of-type { font-size: 0.9rem; }
          .posflow-landing .text-5xl { font-size: 2.25rem; }
          .posflow-landing #pricing .text-5xl { font-size: 2.25rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          .posflow-landing *, .posflow-landing *::before, .posflow-landing *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="fixed w-full top-0 z-50 bg-[#fbf8f2]/80 backdrop-blur-xl border-b border-stone-200/70">
        <Container className="py-4 flex justify-between items-center">
          <a href="#" className="flex items-center gap-2 text-2xl font-black tracking-tight text-teal-800">
            <span className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-lg shadow-teal-700/30"><Store size={22} /></span>
            POSFlow
          </a>

          <div className="hidden lg:flex gap-8 text-sm font-bold text-stone-600">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="hover:text-teal-700 transition">{n.label}</a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-stone-700 hover:text-teal-700 transition">Log In</Link>
            <button onClick={goToDemo} className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-lg shadow-teal-700/25">
              Get Started
            </button>
          </div>

          <button className="lg:hidden p-2 rounded-lg hover:bg-stone-100" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </Container>

        {isMenuOpen && (
          <div className="lg:hidden bg-[#fbf8f2] border-t border-stone-200 px-6 py-5 space-y-4">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setIsMenuOpen(false)} className="block font-bold text-stone-700">{n.label}</a>
            ))}
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1 text-center py-3 rounded-xl border-2 border-stone-200 font-bold">Log In</Link>
              <button onClick={goToDemo} className="flex-1 text-center py-3 rounded-xl bg-teal-700 text-white font-bold">Get Started</button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <header className="relative pt-36 pb-24">
        <div className="absolute -top-20 -left-32 w-[480px] h-[480px] rounded-full bg-teal-200/40 blur-3xl" />
        <div className="absolute top-40 -right-32 w-[420px] h-[420px] rounded-full bg-amber-200/40 blur-3xl" />

        <Container className="relative flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 shadow-sm text-teal-800 text-xs font-bold uppercase tracking-wide">
              <Sparkles size={14} className="text-amber-500" />
              Trusted by 5,000+ stores worldwide
            </div>

            <h1 className="text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight text-stone-900">
              Run your entire business{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-emerald-500">from one screen.</span>
            </h1>

            <p className="text-lg text-stone-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              The all-in-one multi-branch POS. Sell faster, manage inventory, track staff shifts and see live sales across every store — on any device, even offline.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button onClick={goToDemo} className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition shadow-xl shadow-teal-700/25 group">
                Start Free Trial
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              <button onClick={goToDemo} className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold bg-white border border-stone-200 hover:border-teal-300 transition text-stone-800 flex items-center justify-center gap-2">
                <Play size={16} className="text-teal-700 fill-teal-700" /> Watch Demo
              </button>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-x-6 gap-y-3 text-sm font-bold text-stone-600">
              <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-teal-600" /> No credit card</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-teal-600" /> 14-day free trial</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-teal-600" /> Cancel anytime</span>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
              <div className="flex -space-x-2">
                {['bg-teal-300', 'bg-amber-300', 'bg-rose-300', 'bg-sky-300'].map((c, i) => (
                  <div key={i} className={`w-9 h-9 rounded-full ${c} border-2 border-[#fbf8f2]`} />
                ))}
              </div>
              <div className="text-left">
                <div className="flex text-amber-400">{[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-amber-400" />)}</div>
                <p className="text-xs font-bold text-stone-500">4.9/5 from 2,300+ reviews</p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-teal-200 to-amber-100 rounded-[2rem] rotate-3 scale-105 opacity-60 blur-xl" />

            <div className="relative bg-white border border-stone-200 rounded-3xl shadow-2xl shadow-stone-900/10 overflow-hidden">
              <div className="bg-stone-50 border-b border-stone-200 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="ml-4 bg-white border border-stone-200 rounded-md px-4 py-1 text-xs text-stone-400 font-mono">app.posflow.com</div>
              </div>

              <div className="p-6 bg-[#fbf8f2]">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase">Today's Sales</p>
                    <p className="text-3xl font-black text-stone-900">$12,480</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full"><TrendingUp size={14} /> +18.2%</span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    ['Orders', '342', 'bg-teal-100'],
                    ['Branches', '6', 'bg-amber-100'],
                    ['Staff on shift', '28', 'bg-sky-100'],
                  ].map(([l, v, c]) => (
                    <div key={l} className="bg-white p-3 rounded-xl border border-stone-100 shadow-sm">
                      <p className="text-[11px] font-bold text-stone-400">{l}</p>
                      <p className="text-xl font-black mt-1">{v}</p>
                      <div className={`h-1.5 w-12 rounded ${c} mt-2`} />
                    </div>
                  ))}
                </div>

                <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm h-40 flex items-end justify-between gap-2">
                  {[40, 60, 35, 80, 55, 90, 65, 75].map((h, i) => (
                    <div key={i} className="w-full rounded-t-md bg-gradient-to-t from-teal-700 to-teal-400" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="floaty absolute -left-4 sm:-left-10 top-24 bg-white rounded-2xl shadow-xl border border-stone-100 px-4 py-3 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><CheckCircle2 size={20} /></span>
              <div>
                <p className="text-xs font-bold text-stone-400">Payment received</p>
                <p className="text-sm font-black">$248.00</p>
              </div>
            </div>
            <div className="floaty-slow absolute -right-2 sm:-right-8 bottom-10 bg-white rounded-2xl shadow-xl border border-stone-100 px-4 py-3 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center"><Bell size={20} /></span>
              <div>
                <p className="text-xs font-bold text-stone-400">Low stock alert</p>
                <p className="text-sm font-black">Coffee Beans · 4 left</p>
              </div>
            </div>
          </div>
        </Container>
      </header>

      {/* TRUST MARQUEE */}
      <section className="py-10 border-y border-stone-200 bg-white/60">
        <p className="text-center text-xs font-extrabold uppercase tracking-widest text-stone-400 mb-6">Loved by retailers, cafés & restaurants</p>
        <div className="overflow-hidden">
          <div className="marquee flex w-max gap-14 text-2xl font-black text-stone-300">
            {[...Array(2)].map((_, k) => (
              <div key={k} className="flex gap-14 shrink-0">
                {['FreshMart', 'UrbanBrew', 'StyleHub', 'GadgetZone', 'BakeHouse', 'PharmaPlus', 'MegaMart', 'CityGrill'].map((b) => (
                  <span key={b + k}>{b}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16">
        <Container>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white rounded-3xl border border-stone-200 p-8 text-center shadow-sm">
                <p className="text-4xl lg:text-5xl font-black text-teal-700 tracking-tight">{s.value}</p>
                <p className="mt-2 text-sm font-bold text-stone-500">{s.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20">
        <Container>
          <SectionHead eyebrow="Features" title="Everything you need to scale" desc="Powerful tools designed to help you manage multiple branches effortlessly." />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color, span }) => (
              <div key={title} className={`${span || 'md:col-span-1'} group p-8 rounded-3xl bg-white border border-stone-200 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-900/5 hover:-translate-y-1 transition duration-300`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${COLORS[color]}`}><Icon size={28} /></div>
                <h3 className="text-xl font-extrabold text-stone-900 mb-2">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 bg-stone-900 text-white relative overflow-hidden">
        <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl" />
        <Container className="relative">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-teal-300 bg-white/10 px-3 py-1 rounded-full mb-4">How it works</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Up and running in minutes</h2>
            <p className="text-stone-400 font-medium">No technicians, no long setup. Just three simple steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-3xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition">
                <span className="text-5xl font-black text-teal-400/80">{s.n}</span>
                <h3 className="text-xl font-extrabold mt-4 mb-2">{s.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* MULTI-BRANCH SHOWCASE */}
      <section className="py-24">
        <Container className="flex flex-col lg:flex-row items-center gap-14">
          <div className="flex-1 space-y-6">
            <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full">Multi-branch control</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">All your stores. One dashboard. Zero chaos.</h2>
            <p className="text-stone-500 leading-relaxed font-medium">Compare branch performance, transfer stock between outlets and set permissions for every manager and cashier — without leaving your chair.</p>
            <ul className="space-y-3">
              {['Real-time sales across all branches', 'Role-based access for staff & managers', 'Automatic stock transfers & purchase orders', 'Daily summary delivered to your inbox'].map((t) => (
                <li key={t} className="flex items-center gap-3 font-bold text-stone-700"><CheckCircle2 size={20} className="text-teal-600 shrink-0" /> {t}</li>
              ))}
            </ul>
            <button onClick={goToDemo} className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-7 py-3.5 rounded-2xl font-bold transition shadow-lg shadow-teal-700/25">
              Try it free <ArrowRight size={18} />
            </button>
          </div>

          <div className="flex-1 w-full bg-white rounded-3xl border border-stone-200 shadow-xl p-6 space-y-4">
            <p className="font-extrabold text-stone-900">Branch performance</p>
            {[
              ['Downtown', 92, '$4,210'],
              ['Mall Road', 78, '$3,540'],
              ['Airport', 64, '$2,880'],
              ['Westside', 51, '$1,850'],
            ].map(([n, p, v]) => (
              <div key={n}>
                <div className="flex justify-between text-sm font-bold mb-1.5"><span>{n}</span><span className="text-stone-500">{v}</span></div>
                <div className="h-3 rounded-full bg-stone-100 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-teal-700 to-emerald-400" style={{ width: `${p}%` }} /></div>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-2xl bg-teal-50 p-4"><Clock size={18} className="text-teal-700 mb-2" /><p className="text-xs font-bold text-stone-500">Avg. checkout</p><p className="font-black text-lg">2.8s</p></div>
              <div className="rounded-2xl bg-amber-50 p-4"><Zap size={18} className="text-amber-600 mb-2" /><p className="text-xs font-bold text-stone-500">Sync speed</p><p className="font-black text-lg">Instant</p></div>
            </div>
          </div>
        </Container>
      </section>

      {/* HARDWARE */}
      <section className="py-16 bg-white border-y border-stone-200">
        <Container>
          <SectionHead eyebrow="Compatibility" title="Works with the hardware you already own" desc="Plug in your scanner, printer or card reader and start selling." />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {HARDWARE.map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-2xl bg-[#fbf8f2] border border-stone-200 p-6 text-center hover:border-teal-300 transition">
                <Icon size={30} className="mx-auto text-teal-700 mb-3" />
                <p className="text-sm font-bold text-stone-700">{label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24">
        <Container>
          <SectionHead eyebrow="Pricing" title="Simple, transparent pricing" desc="Choose the plan that fits your business size. Upgrade or downgrade anytime." />

          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-bold ${!yearly ? 'text-stone-900' : 'text-stone-400'}`}>Monthly</span>
            <button onClick={() => setYearly(!yearly)} aria-label="Toggle billing" className={`w-14 h-8 rounded-full p-1 transition ${yearly ? 'bg-teal-700' : 'bg-stone-300'}`}>
              <span className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${yearly ? 'translate-x-6' : ''}`} />
            </button>
            <span className={`text-sm font-bold ${yearly ? 'text-stone-900' : 'text-stone-400'}`}>Yearly</span>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">Save 20%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {PLANS.map((p) => (
              <div key={p.name} className={`relative p-8 rounded-3xl flex flex-col ${p.popular ? 'bg-stone-900 text-white shadow-2xl md:-translate-y-4 border border-stone-800' : 'bg-white border border-stone-200 shadow-sm'}`}>
                {p.popular && <div className="absolute top-0 right-8 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-b-lg">MOST POPULAR</div>}
                <h3 className="text-lg font-extrabold mb-1">{p.name}</h3>
                <p className={`text-sm mb-6 ${p.popular ? 'text-stone-400' : 'text-stone-500'}`}>{p.tag}</p>
                <div className="text-5xl font-black mb-6">${price(p.price)}<span className="text-lg font-medium text-stone-400">/mo</span></div>
                <ul className="space-y-3 mb-8 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-sm font-medium ${p.popular ? 'text-stone-300' : 'text-stone-600'}`}>
                      <CheckCircle2 size={16} className={p.popular ? 'text-teal-400' : 'text-teal-600'} /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={goToDemo} className={`w-full py-3.5 rounded-xl font-bold text-center transition ${p.popular ? 'bg-teal-500 text-white hover:bg-teal-400 shadow-lg shadow-teal-500/20' : 'border-2 border-stone-200 text-stone-700 hover:bg-stone-50'}`}>{p.cta}</button>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 bg-white border-y border-stone-200">
        <Container>
          <SectionHead eyebrow="Reviews" title="Business owners love POSFlow" desc="Real stories from real stores that grew with us." />
          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map((r) => (
              <div key={r.name} className="rounded-3xl bg-[#fbf8f2] border border-stone-200 p-8 flex flex-col">
                <Quote size={28} className="text-teal-300 mb-4" />
                <div className="flex text-amber-400 mb-3">{[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-amber-400" />)}</div>
                <p className="text-stone-600 leading-relaxed flex-1">{r.text}</p>
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-stone-200">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-400 to-teal-700 text-white font-black flex items-center justify-center">{r.name[0]}</div>
                  <div>
                    <p className="font-extrabold text-sm">{r.name}</p>
                    <p className="text-xs text-stone-500 font-medium">{r.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <Container className="max-w-3xl">
          <SectionHead eyebrow="FAQ" title="Frequently asked questions" desc="Can't find your answer? Our team replies within a few hours." />
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <FaqItem key={f.q} {...f} open={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? -1 : i)} />
            ))}
          </div>
        </Container>
      </section>

      {/* FINAL CTA */}
      <section className="pb-24">
        <Container>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-teal-800 to-teal-600 px-8 py-16 md:py-20 text-center text-white shadow-2xl shadow-teal-900/20">
                       <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-amber-300/20 blur-3xl" />
            <div className="relative max-w-2xl mx-auto">
              <ShieldCheck size={40} className="mx-auto mb-5 text-teal-200" />
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Ready to take control of your business?</h2>
              <p className="text-teal-100 font-medium mb-8">Join 5,000+ stores already growing with POSFlow. Start your free trial today — no credit card required.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={goToDemo} className="bg-white text-teal-800 px-8 py-4 rounded-2xl font-bold hover:bg-teal-50 transition shadow-lg">
                  Start Free Trial
                </button>
                <button onClick={() => navigate('/login')} className="border-2 border-white/40 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition">
                  Log In
                </button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FOOTER */}
      <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800">
        <Container className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-xl font-black text-white">
            <span className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center"><Store size={18} /></span>
            POSFlow
          </div>
          <div className="flex gap-6 text-sm font-bold">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Support</a>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} POSFlow. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;