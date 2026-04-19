'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  motion,
  useInView,
  AnimatePresence,
} from 'framer-motion'
import {
  ArrowRight, ChevronDown, Zap, Mail, Shield, Bell,
  Users, CreditCard, Globe, Menu, X, Check,
  Star, Clock, Inbox,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Translations ────────────────────────────────────────────────────────────

const t = {
  nav: {
    features: 'Features',
    solution: 'Solution',
    about: 'About',
    signIn: 'Sign in',
    getStarted: 'Get started',
  },
  hero: {
    badge: 'AI Lead Qualification',
    h1a: 'Every lead.',
    h1b: 'Instantly',
    h1c: 'qualified.',
    sub: 'Stop wasting hours on leads that go nowhere. Aclea centralizes every inquiry from WhatsApp, Gmail, and web forms — then uses AI to score and qualify each one in under two seconds.',
    cta1: 'Start for free',
    cta2: 'See how it works',
    stat1v: '50+',
    stat1l: 'Criteria analyzed',
    stat2v: '<2s',
    stat2l: 'AI response time',
    stat3v: '99%',
    stat3l: 'Qualification accuracy',
  },
  features: {
    label: 'Features',
    h2: 'Everything you need to close more deals',
    sub: 'A complete system for capturing, scoring, and routing every inbound lead without lifting a finger.',
    items: [
      {
        title: 'AI-Powered Scoring',
        desc: 'Analyze every inquiry against 50+ real-time criteria: budget signals, decision-maker authority, timeline, and industry fit.',
        icon: Zap,
      },
      {
        title: 'Unified Inbox',
        desc: 'WhatsApp, Gmail, Outlook, web forms — all leads flow into one clean inbox. No more switching between tabs.',
        icon: Inbox,
      },
      {
        title: 'GDPR Compliant',
        desc: 'All data stored on German servers. End-to-end encrypted. Regular security audits. You stay compliant, always.',
        icon: Shield,
      },
      {
        title: 'Instant Alerts',
        desc: 'Hot lead? Get notified immediately — via push, email, or Slack — so you never lose a high-value opportunity.',
        icon: Bell,
      },
      {
        title: 'CRM Sync',
        desc: 'Native integrations with HubSpot, Salesforce, and Pipedrive. Qualified leads land in your CRM automatically.',
        icon: CreditCard,
      },
      {
        title: 'Team Workspace',
        desc: 'Assign leads, leave notes, track conversations, and collaborate across your entire sales team in one place.',
        icon: Users,
      },
    ],
  },
  steps: {
    label: 'How it works',
    h2: 'From inbox to qualified in seconds',
    items: [
      {
        n: '01',
        title: 'Connect your channels',
        desc: 'Link WhatsApp, Gmail, web forms, and more. Setup takes under five minutes.',
      },
      {
        n: '02',
        title: 'AI qualifies instantly',
        desc: 'Every inquiry is analyzed against 50+ criteria the moment it arrives. No manual effort.',
      },
      {
        n: '03',
        title: 'Focus on what matters',
        desc: 'Your inbox shows only leads worth pursuing. Spend time closing, not sorting.',
      },
    ],
  },
  faq: {
    h2: 'Questions & answers',
    sub: 'Everything you need to know before you start.',
    items: [
      {
        q: 'How does the AI qualification actually work?',
        a: 'Our model analyzes budget signals, purchase intent, decision-maker authority, industry fit, and timeline indicators in each message. You get a 0–100 score in under two seconds.',
      },
      {
        q: 'Which channels does Aclea support?',
        a: 'WhatsApp Business, Gmail, Outlook, custom web forms, and a universal API for anything else. All inquiries land in one unified inbox.',
      },
      {
        q: 'Is there a free trial?',
        a: 'Yes — 14 days, full access, no credit card required. You can connect channels and start qualifying leads within minutes of signing up.',
      },
      {
        q: 'Is my data safe?',
        a: 'All data is stored on ISO-certified German servers, encrypted at rest and in transit, and fully GDPR compliant. We publish a transparency report quarterly.',
      },
      {
        q: 'Does it connect to my existing CRM?',
        a: 'Native integrations for HubSpot, Salesforce, and Pipedrive ship out of the box. Any other CRM can be connected via our REST API.',
      },
    ],
  },
  cta: {
    h2: 'Start qualifying in minutes',
    sub: 'No credit card required. Full access for 14 days.',
    btn: 'Create free account',
  },
  footer: {
    tagline: 'AI-powered lead qualification for modern sales teams.',
    product: 'Product',
    productLinks: ['Features', 'Pricing', 'Integrations', 'API'],
    company: 'Company',
    companyLinks: ['About', 'Blog', 'Careers'],
    legal: 'Legal',
    legalLinks: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Imprint', href: '/imprint' },
    ],
    rights: 'All rights reserved.',
    status: 'All systems operational',
  },
}

// ─── Animation helpers ────────────────────────────────────────────────────────

const EASE = 'easeOut' as const

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}

const cardItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}

function fadeUpProps(delay = 0) {
  return {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, ease: EASE, delay },
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [threshold])
  return scrolled
}

function ForceLightMode() {
  useEffect(() => {
    document.documentElement.classList.remove('dark')
    document.documentElement.setAttribute('data-mode', 'light')
  }, [])
  return null
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function Nav() {
  const scrolled = useScrolled()
  const [open, setOpen] = useState(false)

  const links = [
    { label: t.nav.features, scrollId: 'features' },
    { label: t.nav.solution, href: '/solution' },
    { label: t.nav.about, href: '/about' },
  ]

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-4 pt-4"
    >
      <div
        className={cn(
          'mx-auto max-w-5xl rounded-2xl px-5 py-3.5 transition-all duration-500',
          scrolled
            ? 'bg-white/85 backdrop-blur-2xl border border-black/[0.06] shadow-sm shadow-black/[0.04]'
            : 'bg-white/60 backdrop-blur-xl border border-white/70'
        )}
      >
        <div className="relative flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex size-8 items-center justify-center rounded-xl bg-[#0B0B16] group-hover:bg-[#1a1a30] transition-colors">
              <Zap className="size-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-semibold text-[#0B0B16] tracking-tight">Aclea</span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
            {links.map((l) => (
              <li key={l.label}>
                {'scrollId' in l ? (
                  <button
                    onClick={() => scrollToId(l.scrollId!)}
                    className="text-sm font-medium text-[#6B728C] hover:text-[#0B0B16] transition-colors duration-150"
                  >
                    {l.label}
                  </button>
                ) : (
                  <Link
                    href={l.href!}
                    className="text-sm font-medium text-[#6B728C] hover:text-[#0B0B16] transition-colors duration-150"
                  >
                    {l.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm font-medium text-[#6B728C] hover:text-[#0B0B16] px-4 py-2 rounded-xl hover:bg-black/[0.04] transition-all"
            >
              {t.nav.signIn}
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/contact"
                className="text-sm font-semibold text-white bg-[#0B0B16] hover:bg-[#1a1a30] px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                {t.nav.getStarted}
              </Link>
            </motion.div>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-xl text-[#6B728C] hover:bg-black/[0.04] transition-colors"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-4 pb-2 mt-3 border-t border-black/[0.06] space-y-1">
                {links.map((l) => (
                  'scrollId' in l ? (
                    <button
                      key={l.label}
                      onClick={() => { scrollToId(l.scrollId!); setOpen(false) }}
                      className="w-full text-left block text-sm font-medium text-[#6B728C] hover:text-[#0B0B16] py-2 px-2 rounded-lg hover:bg-black/[0.04] transition-all"
                    >
                      {l.label}
                    </button>
                  ) : (
                    <Link
                      key={l.label}
                      href={l.href!}
                      onClick={() => setOpen(false)}
                      className="block text-sm font-medium text-[#6B728C] hover:text-[#0B0B16] py-2 px-2 rounded-lg hover:bg-black/[0.04] transition-all"
                    >
                      {l.label}
                    </Link>
                  )
                ))}
                <div className="pt-3 flex flex-col gap-2">
                  <Link href="/login" className="text-sm font-medium text-center text-[#6B728C] border border-black/10 py-2.5 rounded-xl hover:bg-black/[0.03] transition-all">
                    {t.nav.signIn}
                  </Link>
                  <Link href="/contact" className="text-sm font-semibold text-center text-white bg-[#0B0B16] py-2.5 rounded-xl hover:bg-[#1a1a30] transition-colors">
                    {t.nav.getStarted}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}

// ─── Product Mockup ──────────────────────────────────────────────────────────

const topLeads = [
  { initials: 'SJ', name: 'Sarah Johnson', segment: 'Kitchen Renovation', stars: 5 },
  { initials: 'JR', name: 'James Rodriguez', segment: 'Full Home Renovation', stars: 5 },
  { initials: 'TW', name: 'Thomas Wright', segment: 'Corporate HQ Refresh', stars: 5 },
  { initials: 'RG', name: 'Rachel Green', segment: 'Boutique Store Design', stars: 4 },
  { initials: 'MC', name: 'Michael Chen', segment: 'Commercial Office Build', stars: 4 },
]

const attentionLeads = [
  { initials: 'SJ', name: 'Sarah Johnson', segment: 'Kitchen Renovation', stars: 5 },
  { initials: 'MC', name: 'Michael Chen', segment: 'Commercial Office Build-out', stars: 4 },
  { initials: 'KO', name: "Kevin O'Brien", segment: 'Law Office Renovation', stars: 4 },
  { initials: 'DP', name: 'David Park', segment: 'Deck Construction', stars: 3 },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-px">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={cn('w-2.5 h-2.5', i <= count ? 'text-yellow-400' : 'text-gray-200')} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function LeadRow({ lead, index, review }: { lead: typeof topLeads[0], index?: number, review?: boolean }) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-gray-50 transition-colors">
      {index !== undefined && (
        <span className="text-[10px] text-gray-400 w-3 text-right shrink-0">{index + 1}</span>
      )}
      <div className="size-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
        <span className="text-[9px] font-semibold text-gray-600">{lead.initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-gray-900 truncate">{lead.name}</span>
          {review && (
            <span className="text-[9px] font-medium px-1 py-px rounded bg-yellow-100 text-yellow-700 shrink-0">Review</span>
          )}
        </div>
        <span className="text-[10px] text-gray-400 truncate block">{lead.segment}</span>
      </div>
      <Stars count={lead.stars} />
    </div>
  )
}

function ProductMockup() {
  return (
    <div className="relative w-full select-none">
      {/* Main browser window */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.55, duration: 0.8, ease: EASE }}
        className="relative rounded-2xl overflow-hidden border border-black/[0.08] shadow-2xl shadow-black/[0.12]"
        style={{ background: '#F5F5F4' }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200/80 bg-white">
          <div className="flex gap-1.5 shrink-0">
            <div className="size-2.5 rounded-full bg-red-400/80" />
            <div className="size-2.5 rounded-full bg-yellow-400/80" />
            <div className="size-2.5 rounded-full bg-green-400/80" />
          </div>
          <div className="flex-1 mx-3">
            <div className="h-4 rounded bg-gray-100 mx-auto max-w-[180px] flex items-center justify-center">
              <span className="text-[8px] text-gray-400 font-medium">app.aclea.io/dashboard</span>
            </div>
          </div>
        </div>

        {/* App header — matches real AppHeader */}
        <div className="flex items-center gap-0 px-4 py-2 bg-white border-b border-gray-200/80">
          <div className="flex items-center gap-1.5 mr-6">
            <div className="size-5 rounded-md bg-[#0B0B16] flex items-center justify-center">
              <Zap className="size-3 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[12px] font-semibold text-gray-900">aclea</span>
          </div>
          {/* Nav tabs */}
          <div className="flex items-center gap-0.5">
            {['Dashboard', 'Leads', 'Analytics'].map((tab) => (
              <div
                key={tab}
                className={cn(
                  'text-[11px] font-medium px-2.5 py-1 rounded-md',
                  tab === 'Dashboard' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'
                )}
              >
                {tab}
              </div>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Bell className="size-3.5 text-gray-500" />
              <div className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-gray-900" />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
              <div className="size-5 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-[8px] font-semibold text-gray-600">JH</span>
              </div>
              <span>johnny hon</span>
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="px-5 py-4 space-y-4">
          {/* Greeting */}
          <div className="text-center py-2">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-[9px] text-gray-500 mb-2">
              <span className="size-1 rounded-full bg-green-500" />
              AI-Powered Lead Management
            </div>
            <div className="text-[15px] font-semibold text-gray-900 tracking-tight">Good morning, johnny</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Here's your lead overview</div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Total Leads', value: '18', sub: 'All time', border: 'border-l-gray-400' },
              { label: 'New Today', value: '0', sub: 'No new leads', border: '' },
              { label: 'Needs Review', value: '9', sub: 'Action required', border: 'border-l-yellow-400' },
              { label: 'Approved', value: '7', sub: 'Ready to convert', border: 'border-l-green-500' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.06, duration: 0.4, ease: EASE }}
                className={cn(
                  'rounded-lg border border-gray-200 bg-white p-3',
                  stat.border && `border-l-2 ${stat.border}`
                )}
              >
                <div className="text-[9px] text-gray-400">{stat.label}</div>
                <div className="text-xl font-semibold text-gray-900 tracking-tight mt-0.5">{stat.value}</div>
                <div className="text-[9px] text-gray-400 mt-0.5">{stat.sub}</div>
              </motion.div>
            ))}
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-2 gap-2">
            {/* Top Leads */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="size-4 rounded bg-gray-100 flex items-center justify-center">
                    <Star className="size-2.5 text-gray-400" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-900">Top Leads</span>
                </div>
                <div className="flex items-center gap-0.5 text-[10px] text-gray-400">
                  View all <ArrowRight className="size-2.5" />
                </div>
              </div>
              <div className="p-1.5 space-y-0">
                {topLeads.map((lead, i) => (
                  <motion.div
                    key={lead.name}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 + i * 0.06, duration: 0.35, ease: EASE }}
                  >
                    <LeadRow lead={lead} index={i} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Needs Attention */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="size-4 rounded bg-gray-100 flex items-center justify-center">
                    <Clock className="size-2.5 text-gray-400" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-900">Needs Attention</span>
                </div>
                <div className="flex items-center gap-0.5 text-[10px] text-gray-400">
                  View all <ArrowRight className="size-2.5" />
                </div>
              </div>
              <div className="p-1.5 space-y-0">
                {attentionLeads.map((lead, i) => (
                  <motion.div
                    key={lead.name + i}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 + i * 0.06, duration: 0.35, ease: EASE }}
                  >
                    <LeadRow lead={lead} review />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 rounded-b-2xl pointer-events-none bg-gradient-to-t from-[#D9DFED] to-transparent" />
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-20 px-6 overflow-hidden bg-[#D9DFED]">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(100,90,240,0.10) 0%, transparent 65%)' }}
        />
        <div
          className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 65%)' }}
        />
        <div
          className="absolute bottom-0 -left-40 w-[500px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 65%)' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          {...fadeUpProps(0)}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-white/90 backdrop-blur-sm shadow-sm">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-[#6B728C] tracking-wide">{t.hero.badge}</span>
          </div>
        </motion.div>

        {/* Headline */}
        <div className="text-center mb-7">
          <h1 className="text-6xl md:text-7xl lg:text-[86px] font-semibold tracking-[-0.035em] leading-[1.0] text-[#0B0B16]">
            <motion.span {...fadeUpProps(0.05)} className="block">
              {t.hero.h1a}
            </motion.span>
            <motion.span
              {...fadeUpProps(0.15)}
              className="block"
              style={{
                background: 'linear-gradient(135deg, #2d2b6b 0%, #5b4fcf 45%, #8b7ff0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t.hero.h1b}
            </motion.span>
            <motion.span {...fadeUpProps(0.25)} className="block text-[#9AA8C4]">
              {t.hero.h1c}
            </motion.span>
          </h1>
        </div>

        {/* Subtitle */}
        <motion.p
          {...fadeUpProps(0.35)}
          className="text-lg md:text-xl text-[#6B728C] max-w-2xl mx-auto text-center leading-relaxed font-light mb-10"
        >
          {t.hero.sub}
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...fadeUpProps(0.45)}
          className="flex items-center justify-center gap-3 flex-wrap mb-14"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#0B0B16] hover:bg-[#1a1a30] px-7 py-3.5 rounded-xl transition-colors shadow-lg shadow-black/20"
            >
              {t.hero.cta1}
              <ArrowRight className="size-4" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <button
              onClick={() => scrollToId('how-it-works')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B0B16] bg-white/80 hover:bg-white border border-white/90 px-7 py-3.5 rounded-xl transition-all shadow-sm backdrop-blur-sm cursor-pointer"
            >
              {t.hero.cta2}
            </button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          {...fadeUpProps(0.55)}
          className="flex items-center justify-center gap-6 md:gap-14 flex-wrap mb-16"
        >
          {[
            { v: t.hero.stat1v, l: t.hero.stat1l },
            { v: t.hero.stat2v, l: t.hero.stat2l },
            { v: t.hero.stat3v, l: t.hero.stat3l },
          ].map((s, i, arr) => (
            <React.Fragment key={i}>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#0B0B16] tracking-tight">{s.v}</div>
                <div className="text-xs text-[#9AA8C4] mt-1 font-medium">{s.l}</div>
              </div>
              {i < arr.length - 1 && <div className="hidden md:block w-px h-10 bg-black/10" />}
            </React.Fragment>
          ))}
        </motion.div>

        {/* Product mockup */}
        <div className="px-2 md:px-0">
          <ProductMockup />
        </div>
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

function Features() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-28 bg-white" id="features" ref={ref}>
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.div variants={cardItem} className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-gray-200/80 bg-gray-50">
            <Zap className="size-3.5 text-[#6B728C]" strokeWidth={2.5} />
            <span className="text-xs font-semibold text-[#6B728C] uppercase tracking-wider">{t.features.label}</span>
          </motion.div>
          <motion.h2 variants={cardItem} className="text-4xl md:text-5xl font-semibold tracking-tight text-[#0B0B16] mb-4">
            {t.features.h2}
          </motion.h2>
          <motion.p variants={cardItem} className="text-lg text-[#6B728C] font-light max-w-xl mx-auto leading-relaxed">
            {t.features.sub}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={stagger}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {t.features.items.map((feat) => (
            <motion.div
              key={feat.title}
              variants={cardItem}
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
              className="group rounded-2xl border border-gray-100 bg-[#F8F9FC] p-7 transition-colors duration-300 hover:bg-white cursor-default"
            >
              <div className="mb-5 inline-flex size-11 items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm group-hover:border-gray-300 group-hover:shadow transition-all duration-300">
                <feat.icon className="size-5 text-[#0B0B16]" />
              </div>
              <h3 className="mb-2 text-[15px] font-semibold text-[#0B0B16]">{feat.title}</h3>
              <p className="text-sm text-[#6B728C] leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── How it works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-28 bg-[#D9DFED]" id="how-it-works" ref={ref}>
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.div variants={cardItem} className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-white/70 border border-white/90 backdrop-blur-sm">
            <span className="text-xs font-semibold text-[#6B728C] uppercase tracking-wider">{t.steps.label}</span>
          </motion.div>
          <motion.h2 variants={cardItem} className="text-4xl md:text-5xl font-semibold tracking-tight text-[#0B0B16]">
            {t.steps.h2}
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={stagger}
          className="grid gap-6 md:grid-cols-3"
        >
          {t.steps.items.map((step, i) => (
            <motion.div
              key={step.n}
              variants={cardItem}
              className="relative bg-white/70 backdrop-blur-sm rounded-2xl border border-white/80 p-7 shadow-sm"
            >
              <div
                className="text-7xl font-bold tracking-tighter leading-none mb-5 select-none"
                style={{ color: 'rgba(0,0,0,0.06)' }}
              >
                {step.n}
              </div>
              <h3 className="text-[15px] font-semibold text-[#0B0B16] mb-2">{step.title}</h3>
              <p className="text-sm text-[#6B728C] leading-relaxed">{step.desc}</p>
              {i < t.steps.items.length - 1 && (
                <div className="hidden md:flex items-center justify-center absolute top-10 left-full w-6 h-6 text-[#C0C8DA] z-10">
                  <ArrowRight className="size-5" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-28 bg-white" ref={ref}>
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.h2 variants={cardItem} className="text-4xl md:text-5xl font-semibold tracking-tight text-[#0B0B16] mb-4">
            {t.faq.h2}
          </motion.h2>
          <motion.p variants={cardItem} className="text-lg text-[#6B728C] font-light">{t.faq.sub}</motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={stagger}
          className="space-y-2.5"
        >
          {t.faq.items.map((item, i) => (
            <motion.div
              key={i}
              variants={cardItem}
              className="rounded-2xl border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left group"
              >
                <span className="text-sm font-semibold text-[#0B0B16] pr-4 group-hover:text-[#3A3F52] transition-colors">
                  {item.q}
                </span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="shrink-0 text-[#9AA0B5]"
                >
                  <ChevronDown className="size-4" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-sm text-[#6B728C] leading-relaxed border-t border-gray-100 pt-4">
                      {item.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

function CTABanner() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-6 px-6 bg-white" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="mx-auto max-w-5xl rounded-3xl bg-[#0B0B16] px-10 py-16 text-center relative overflow-hidden"
      >
        {/* Subtle background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(100,90,240,0.25) 0%, transparent 65%)' }}
        />
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
            {t.cta.h2}
          </h2>
          <p className="text-[#7A7F97] text-lg font-light mb-10">{t.cta.sub}</p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B0B16] bg-white hover:bg-gray-100 px-8 py-4 rounded-xl transition-colors shadow-lg"
            >
              {t.cta.btn}
              <ArrowRight className="size-4" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1fr_auto_auto_auto]">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex size-8 items-center justify-center rounded-xl bg-[#0B0B16]">
                <Zap className="size-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[15px] font-semibold text-[#0B0B16] tracking-tight">Aclea</span>
            </Link>
            <p className="text-sm text-[#9AA0B5] leading-relaxed max-w-[220px]">{t.footer.tagline}</p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-[11px] font-semibold text-[#0B0B16] uppercase tracking-widest mb-4">{t.footer.product}</h3>
            <ul className="space-y-2.5">
              {t.footer.productLinks.map((l) => (
                <li key={l}><Link href="#" className="text-sm text-[#9AA0B5] hover:text-[#0B0B16] transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-[11px] font-semibold text-[#0B0B16] uppercase tracking-widest mb-4">{t.footer.company}</h3>
            <ul className="space-y-2.5">
              {t.footer.companyLinks.map((l) => (
                <li key={l}><Link href="#" className="text-sm text-[#9AA0B5] hover:text-[#0B0B16] transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[11px] font-semibold text-[#0B0B16] uppercase tracking-widest mb-4">{t.footer.legal}</h3>
            <ul className="space-y-2.5">
              {t.footer.legalLinks.map((l) => (
                <li key={l.label}><Link href={l.href} className="text-sm text-[#9AA0B5] hover:text-[#0B0B16] transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[#C4CAD6]">
            <div className="size-1.5 rounded-full bg-emerald-400" />
            <span>{t.footer.status}</span>
          </div>
          <p className="text-sm text-[#C4CAD6]">
            &copy; {new Date().getFullYear()} Aclea GmbH. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <>
      <ForceLightMode />
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <FAQ />
      <CTABanner />
      <Footer />
    </>
  )
}
