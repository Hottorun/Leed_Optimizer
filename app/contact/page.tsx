'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MapPin, Send, Check } from 'lucide-react'

const S = {
  page: { minHeight: '100vh', backgroundColor: '#fafafa', color: '#111111' } as const,
  header: { position: 'sticky' as const, top: 0, zIndex: 20, borderBottom: '1px solid #e5e5e5', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)' },
  nav: { maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem', height: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' },
  logoIcon: { display: 'flex', height: '1.75rem', width: '1.75rem', alignItems: 'center', justifyContent: 'center', borderRadius: '0.375rem', backgroundColor: '#111111' },
  card: { borderRadius: '1rem', border: '1px solid #e5e5e5', backgroundColor: '#ffffff' },
  input: { width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e5e5', backgroundColor: '#f9f9f9', color: '#111111', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const },
  label: { display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#111111', marginBottom: '0.375rem' },
  btn: { width: '100%', padding: '0.625rem 1rem', backgroundColor: '#111111', color: '#ffffff', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' },
}

export default function ContactPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to send message")
      }
      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  if (isSubmitted) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ maxWidth: '28rem', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '4rem', height: '4rem', backgroundColor: '#f5f5f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid #e5e5e5' }}>
            <Check style={{ width: '1.75rem', height: '1.75rem', color: '#111111' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Message Sent!</h1>
          <p style={{ color: '#737373', marginBottom: '1.5rem' }}>Thank you for reaching out. We'll get back to you within 24 hours.</p>
          <button onClick={() => router.push('/')} style={{ ...S.btn, width: 'auto', padding: '0.625rem 1.5rem' }}>
            Back to Home
          </button>
        </div>
      </div>
    )
  }

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

      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>Get in Touch</h1>
          <p style={{ fontSize: '1.125rem', color: '#737373', maxWidth: '32rem' }}>
            Interested in Aclea? We'd love to hear from you. Fill out the form and we'll get back to you as soon as possible.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          {/* Contact Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: Mail, label: 'Email', value: 'contact@aclea.de', href: 'mailto:contact@aclea.de' },
              { icon: Phone, label: 'Phone', value: '+49 (0) 30 123 456 78', href: null },
              { icon: MapPin, label: 'Address', value: 'Berlin, Germany', href: null },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: '1rem', height: '1rem', color: '#111111' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#a3a3a3', marginBottom: '0.125rem' }}>{label}</p>
                  {href ? (
                    <a href={href} style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111111' }}>{value}</a>
                  ) : (
                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111111' }}>{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div style={{ ...S.card, padding: '2rem' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { id: 'name', label: 'Name', type: 'text', placeholder: 'Your name', required: true },
                { id: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', required: true },
                { id: 'company', label: 'Company (optional)', type: 'text', placeholder: 'Your company', required: false },
              ].map(({ id, label, type, placeholder, required }) => (
                <div key={id}>
                  <label htmlFor={id} style={S.label}>{label}</label>
                  <input
                    type={type}
                    id={id}
                    name={id}
                    required={required}
                    value={formData[id as keyof typeof formData]}
                    onChange={handleChange}
                    style={S.input}
                    placeholder={placeholder}
                  />
                </div>
              ))}
              <div>
                <label htmlFor="message" style={S.label}>Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  style={{ ...S.input, resize: 'none' }}
                  placeholder="Tell us about your needs..."
                />
              </div>
              {error && (
                <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}
              <button type="submit" disabled={isSubmitting} style={{ ...S.btn, opacity: isSubmitting ? 0.6 : 1 }}>
                {isSubmitting ? (
                  <div style={{ width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
                ) : (
                  <Send style={{ width: '1rem', height: '1rem' }} />
                )}
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
