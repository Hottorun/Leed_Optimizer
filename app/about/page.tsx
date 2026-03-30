'use client'

import Link from 'next/link'
import { ArrowLeft, Users, Target, Zap, Shield, Globe, Mail, Phone, MapPin } from 'lucide-react'

const S = {
  page: { minHeight: '100vh', backgroundColor: '#fafafa', color: '#111111', fontFamily: 'inherit' } as const,
  header: { position: 'sticky' as const, top: 0, zIndex: 20, borderBottom: '1px solid #e5e5e5', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)' },
  nav: { maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem', height: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' },
  logoIcon: { display: 'flex', height: '1.75rem', width: '1.75rem', alignItems: 'center', justifyContent: 'center', borderRadius: '0.375rem', backgroundColor: '#111111' },
  logoText: { fontSize: '0.875rem', fontWeight: 600, letterSpacing: '-0.01em', color: '#111111' },
  backLink: { display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: '#737373', textDecoration: 'none' },
  main: { paddingBottom: '5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' },
  container: { maxWidth: '56rem', margin: '0 auto', paddingTop: '4rem' },
  card: { padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e5e5e5', backgroundColor: '#ffffff' },
  iconBox: { width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' },
  footer: { borderTop: '1px solid #e5e5e5', backgroundColor: '#ffffff', padding: '2rem 1.5rem' },
}

export default function AboutPage() {
  return (
    <div style={S.page}>
      <header style={S.header}>
        <div style={S.nav}>
          <Link href="/" style={S.logo}>
            <div style={S.logoIcon}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>A</span>
            </div>
            <span style={S.logoText}>aclea</span>
          </Link>
          <Link href="/" style={S.backLink}>
            <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
            Back to Home
          </Link>
        </div>
      </header>

      <main style={S.main}>
        <div style={S.container}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.03em' }}>About Aclea</h1>
          <p style={{ fontSize: '1.25rem', color: '#737373', marginBottom: '4rem', maxWidth: '36rem' }}>
            We're on a mission to help businesses qualify leads faster and smarter with AI-powered automation.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3rem', marginBottom: '5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Our Mission</h2>
              <p style={{ color: '#737373', lineHeight: '1.6' }}>
                At Aclea, we believe that every lead deserves attention, but not every lead deserves your time.
                Our AI-powered platform automatically qualifies leads based on 50+ criteria, helping you focus
                on the opportunities that actually matter.
              </p>
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Our Story</h2>
              <p style={{ color: '#737373', lineHeight: '1.6' }}>
                Founded in 2024, Aclea was born from a simple frustration: spending hours evaluating leads
                that never converted. We built a solution that uses advanced AI to do the heavy lifting,
                so our customers can focus on closing deals.
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem', textAlign: 'center' }}>Why Choose Aclea</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              {[
                { icon: Zap, title: 'Lightning Fast', desc: 'Qualify leads in seconds, not hours' },
                { icon: Shield, title: 'GDPR Compliant', desc: 'Your data is safe with us' },
                { icon: Globe, title: 'German Servers', desc: 'Hosted in Germany for maximum security' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} style={S.card}>
                  <div style={S.iconBox}><Icon style={{ width: '1.25rem', height: '1.25rem', color: '#111111' }} /></div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{title}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#737373' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem', textAlign: 'center' }}>Our Values</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              {[
                { icon: Users, title: 'Customer First', desc: 'We build products that solve real problems for our customers.' },
                { icon: Target, title: 'Continuous Innovation', desc: "We're always improving our AI to deliver better results." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} style={{ ...S.card, display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ ...S.iconBox, marginBottom: 0, flexShrink: 0 }}><Icon style={{ width: '1rem', height: '1rem', color: '#111111' }} /></div>
                  <div>
                    <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{title}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#737373' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem', textAlign: 'center' }}>Get in Touch</h2>
            <div style={{ ...S.card, display: 'flex', flexWrap: 'wrap' as const, gap: '2rem', justifyContent: 'center', alignItems: 'center' }}>
              {[
                { icon: Mail, text: 'contact@aclea.de' },
                { icon: Phone, text: '+49 (0) 30 123 456 78' },
                { icon: MapPin, text: 'Berlin, Deutschland' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#737373' }}>
                  <Icon style={{ width: '1.25rem', height: '1.25rem', color: '#111111' }} />
                  <span style={{ fontSize: '0.875rem' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer style={S.footer}>
        <div style={{ maxWidth: '56rem', margin: '0 auto', textAlign: 'center', color: '#a3a3a3', fontSize: '0.875rem' }}>
          &copy; {new Date().getFullYear()} Aclea GmbH. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
