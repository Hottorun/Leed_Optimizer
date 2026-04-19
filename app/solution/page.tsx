'use client'

import Link from 'next/link'
import { ArrowLeft, Zap, MessageSquare, Bell, Users, BarChart3, Shield, Check, Clock, Target, ArrowRight } from 'lucide-react'

const S = {
  page: { minHeight: '100vh', backgroundColor: '#fafafa', color: '#111111' } as const,
  header: { position: 'sticky' as const, top: 0, zIndex: 20, borderBottom: '1px solid #e5e5e5', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)' },
  nav: { maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem', height: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' },
  logoIcon: { display: 'flex', height: '1.75rem', width: '1.75rem', alignItems: 'center', justifyContent: 'center', borderRadius: '0.375rem', backgroundColor: '#111111' },
  card: { padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e5e5e5', backgroundColor: '#ffffff' },
  iconBox: { width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' },
  footer: { borderTop: '1px solid #e5e5e5', backgroundColor: '#ffffff', padding: '2rem 1.5rem' },
  primaryBtn: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#111111', color: '#ffffff', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' } as const,
}

export default function SolutionPage() {
  const features = [
    { icon: Zap, title: 'AI-Powered Qualification', description: 'Our advanced AI analyzes incoming leads and scores them based on 50+ criteria including budget signals, purchase readiness, and industry fit.', benefits: ['Instant lead scoring', 'Priority ranking', 'Conversion predictions'] },
    { icon: MessageSquare, title: 'Unified Inbox', description: 'Receive leads from WhatsApp, Email, Web Forms, and more - all in one centralized dashboard.', benefits: ['WhatsApp integration', 'Email parsing', 'Web form capture'] },
    { icon: Bell, title: 'Real-time Notifications', description: 'Never miss a hot lead. Get instant notifications when high-quality leads come in.', benefits: ['Instant alerts', 'Customizable triggers', 'Multi-channel delivery'] },
    { icon: Users, title: 'Team Collaboration', description: 'Work together efficiently with your team. Assign leads, share notes, and track progress.', benefits: ['Lead assignment', 'Shared inbox', 'Activity tracking'] },
    { icon: BarChart3, title: 'Advanced Analytics', description: 'Get insights into your lead pipeline with comprehensive dashboards and reports.', benefits: ['Conversion tracking', 'Source analytics', 'Performance metrics'] },
    { icon: Shield, title: 'Enterprise Security', description: 'Your data is safe with us. GDPR compliant with German servers and end-to-end encryption.', benefits: ['GDPR compliant', 'German hosting', 'Data encryption'] },
  ]

  const useCases = [
    { title: 'For Real Estate', description: 'Qualify property inquiries instantly. Focus on buyers ready to make offers.', icon: Target },
    { title: 'For Agencies', description: 'Handle client onboarding at scale. Let AI filter out time-wasters.', icon: Users },
    { title: 'For SaaS', description: 'Identify trial users worth converting. Prioritize your sales efforts.', icon: Zap },
    { title: 'For E-commerce', description: 'Score wholesale inquiries. Find B2B partners worth pursuing.', icon: BarChart3 },
  ]

  return (
    <div style={S.page}>
      <header style={S.header}>
        <div style={S.nav}>
          <Link href="/" style={S.logo}>
            <div style={S.logoIcon}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>A</span>
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, letterSpacing: '-0.01em', color: '#111111' }}>aclea</span>
          </Link>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: '#737373', textDecoration: 'none' }}>
            <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
            Back to Home
          </Link>
        </div>
      </header>

      <main style={{ paddingBottom: '5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', paddingTop: '4rem' }}>

          {/* Hero */}
          <div style={{ textAlign: 'center', maxWidth: '48rem', margin: '0 auto 5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', marginBottom: '1.5rem', borderRadius: '9999px', border: '1px solid #e5e5e5', backgroundColor: '#ffffff', fontSize: '0.75rem', fontWeight: 500, color: '#737373' }}>
              <Zap style={{ width: '0.875rem', height: '0.875rem' }} />
              The AI Lead Solution
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
              Stop Qualifying Leads Manually.{' '}
              <span style={{ color: '#a3a3a3' }}>Let AI Do It.</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#737373', marginBottom: '2rem', maxWidth: '36rem', margin: '0 auto 2rem' }}>
              Aclea automatically scores and prioritizes your leads using advanced AI, so you can focus on closing deals instead of sorting through inquiries.
            </p>
            <Link href="/contact" style={S.primaryBtn}>
              Get Started <ArrowRight style={{ width: '1rem', height: '1rem' }} />
            </Link>
          </div>

          {/* Problem/Solution */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '5rem' }}>
            <div style={{ padding: '2rem', borderRadius: '1rem', border: '1px solid #fecaca', backgroundColor: '#fff5f5' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#dc2626' }}>The Problem</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#737373' }}>
                {['Spending hours reviewing every inquiry', 'Missing hot leads in your inbox', 'Following up with unqualified prospects', 'No visibility into lead quality'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <span style={{ color: '#f87171', marginTop: '0.125rem', flexShrink: 0 }}>✕</span>{item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ padding: '2rem', borderRadius: '1rem', border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#16a34a' }}>The Aclea Solution</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#737373' }}>
                {['AI scores leads in seconds', 'Instant notifications for top leads', 'Auto-qualify with 50+ criteria', 'Real-time analytics dashboard'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <span style={{ color: '#22c55e', marginTop: '0.125rem', flexShrink: 0 }}>✓</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Features */}
          <div style={{ marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem', textAlign: 'center', letterSpacing: '-0.02em' }}>Powerful Features</h2>
            <p style={{ color: '#737373', textAlign: 'center', marginBottom: '3rem', maxWidth: '36rem', margin: '0 auto 3rem' }}>Everything you need to automate lead qualification and close more deals.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              {features.map((feature, i) => (
                <div key={i} style={S.card}>
                  <div style={S.iconBox}><feature.icon style={{ width: '1.25rem', height: '1.25rem', color: '#111111' }} /></div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{feature.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#737373', marginBottom: '1rem' }}>{feature.description}</p>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {feature.benefits.map((b, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#737373' }}>
                        <Check style={{ width: '0.875rem', height: '0.875rem', color: '#111111', flexShrink: 0 }} />{b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div style={{ marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem', textAlign: 'center', letterSpacing: '-0.02em' }}>Built for Your Industry</h2>
            <p style={{ color: '#737373', textAlign: 'center', marginBottom: '3rem', maxWidth: '36rem', margin: '0 auto 3rem' }}>Aclea adapts to your specific business needs.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
              {useCases.map((u, i) => (
                <div key={i} style={{ ...S.card, textAlign: 'center' }}>
                  <div style={{ ...S.iconBox, margin: '0 auto 1rem' }}><u.icon style={{ width: '1.25rem', height: '1.25rem', color: '#111111' }} /></div>
                  <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>{u.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#737373' }}>{u.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', backgroundColor: '#e5e5e5', borderRadius: '1rem', overflow: 'hidden', border: '1px solid #e5e5e5', marginBottom: '5rem' }}>
            {[{ value: '50+', label: 'Qualification Criteria' }, { value: '85%', label: 'Time Saved' }, { value: '3x', label: 'More Conversions' }, { value: '24/7', label: 'AI Availability' }].map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#ffffff' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#111111' }}>{value}</div>
                <div style={{ fontSize: '0.875rem', color: '#737373' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', padding: '3rem', borderRadius: '1.5rem', border: '1px solid #e5e5e5', backgroundColor: '#ffffff' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Clock style={{ width: '1.5rem', height: '1.5rem', color: '#ffffff' }} />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.02em' }}>Ready to Qualify Leads Smarter?</h2>
            <p style={{ color: '#737373', marginBottom: '2rem', maxWidth: '32rem', margin: '0 auto 2rem' }}>Join hundreds of businesses using Aclea to save time and close more deals.</p>
            <Link href="/contact" style={S.primaryBtn}>
              Talk to Sales <ArrowRight style={{ width: '1rem', height: '1rem' }} />
            </Link>
          </div>
        </div>
      </main>

      <footer style={S.footer}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', textAlign: 'center', color: '#a3a3a3', fontSize: '0.875rem' }}>
          &copy; {new Date().getFullYear()} Aclea GmbH. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
