'use client'

import Link from 'next/link'
import { ArrowLeft, Users, Target, Zap, Shield, Globe, Mail, Phone, MapPin } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <header className="fixed z-20 w-full px-2">
        <nav className="mx-auto mt-2 max-w-6xl px-6 py-3 lg:py-4 border border-white/10 rounded-2xl bg-black/50 backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600">
              <Zap className="size-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">Aclea</span>
          </Link>
        </nav>
      </header>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Aclea</h1>
          <p className="text-xl text-white/60 mb-16 max-w-2xl">
            We're on a mission to help businesses qualify leads faster and smarter with AI-powered automation.
          </p>

          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-white/60 leading-relaxed">
                At Aclea, we believe that every lead deserves attention, but not every lead deserves your time. 
                Our AI-powered platform automatically qualifies leads based on 50+ criteria, helping you focus 
                on the opportunities that actually matter.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
              <p className="text-white/60 leading-relaxed">
                Founded in 2024, Aclea was born from a simple frustration: spending hours evaluating leads 
                that never converted. We built a solution that uses advanced AI to do the heavy lifting, 
                so our customers can focus on closing deals.
              </p>
            </div>
          </div>

          <div className="mb-20">
            <h2 className="text-2xl font-semibold mb-8 text-center">Why Choose Aclea</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
                <Zap className="size-8 text-emerald-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
                <p className="text-white/60 text-sm">Qualify leads in seconds, not hours</p>
              </div>
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
                <Shield className="size-8 text-emerald-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">GDPR Compliant</h3>
                <p className="text-white/60 text-sm">Your data is safe with us</p>
              </div>
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
                <Globe className="size-8 text-emerald-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">German Servers</h3>
                <p className="text-white/60 text-sm">Hosted in Germany for maximum security</p>
              </div>
            </div>
          </div>

          <div className="mb-20">
            <h2 className="text-2xl font-semibold mb-8 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <Users className="size-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Customer First</h3>
                  <p className="text-white/60 text-sm">We build products that solve real problems for our customers.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Target className="size-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Continuous Innovation</h3>
                  <p className="text-white/60 text-sm">We're always improving our AI to deliver better results.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-20">
            <h2 className="text-2xl font-semibold mb-8 text-center">Get in Touch</h2>
            <div className="flex flex-col md:flex-row gap-8 justify-center">
              <div className="flex items-center gap-3 text-white/60">
                <Mail className="size-5 text-emerald-400" />
                <span>kontakt@aclea.de</span>
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <Phone className="size-5 text-emerald-400" />
                <span>+49 (0) 30 123 456 78</span>
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <MapPin className="size-5 text-emerald-400" />
                <span>Berlin, Deutschland</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-black/50 py-8 px-6">
        <div className="max-w-4xl mx-auto text-center text-white/40 text-sm">
          &copy; {new Date().getFullYear()} Aclea GmbH. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
