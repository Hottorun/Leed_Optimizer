'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { ArrowRight, ChevronDown, CreditCard, Heart, Menu, Shield, X, Zap, Mail, Phone, MapPin, Sun, Moon, Globe, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLanguage } from './language-provider'
import { HeroGeometric } from '@/components/ui/shape-landing-hero'

const translations = {
  de: {
    badge: "KI-gestützte Lead-Qualifizierung",
    title: "Jeder Lead. Ein Ort. Sofort qualifiziert.",
    subtitle: "Hören Sie auf, Stunden damit zu verschwenden, Leads zu bewerten, die nicht zu Ihrem Unternehmen passen. Aclea zentralisiert alle Ihre Anfragen von WhatsApp, Gmail und anderen Kanälen – und nutzt KI, um sofort zu bestimmen, ob jeder Lead Ihre Zeit wert ist.",
    getStarted: "Jetzt starten",
    features: "Funktionen",
    powerfulFeatures: "Leistungsstarke Funktionen",
    discoverFeatures: "Entdecken Sie die Funktionen, die Ihnen helfen, mehr Zeit für die wirklich wichtigen Leads zu haben.",
    tryFree: "Jetzt kostenlos testen",
    aiTitle: "KI-gestützte Qualifizierung",
    aiDesc: "Unsere KI analysiert eingehende Anfragen automatisch und bewertet Leads in Echtzeit nach über 50 Kriterien.",
    inboxTitle: "Unified Inbox",
    inboxDesc: "Alle Anfragen von WhatsApp, Gmail, Kontaktformularen und mehr an einem zentralen Ort.",
    gdprTitle: "DSGVO-konform",
    gdprDesc: "Alle Daten werden auf deutschen Servern gespeichert und sind vollständig DSGVO-konform.",
    notifyTitle: "Echtzeit-Benachrichtigungen",
    notifyDesc: "Verpassen Sie nie wieder einen wichtigen Lead. Sofortige Benachrichtigungen bei neuen Anfragen.",
    crmTitle: "CRM-Integration",
    crmDesc: "Nahtlose Integration mit HubSpot, Salesforce, Pipedrive und vielen weiteren CRM-Systemen.",
    teamTitle: "Team-Zusammenarbeit",
    teamDesc: "Arbeiten Sie effizient im Team. Weisen Sie Leads zu, hinterlassen Sie Notizen und behalten Sie den Überblick.",
    faqTitle: "Häufig gestellte Fragen",
    faqDesc: "Finden Sie schnelle und umfassende Antworten auf häufige Fragen zu unserer Plattform.",
    faq1Q: "Wie funktioniert die KI-gestützte Lead-Qualifizierung?",
    faq1A: "Unsere KI analysiert eingehende Anfragen automatisch anhand von über 50 Kriterien, darunter Budget-Signale, Kaufbereitschaft und Branchenzugehörigkeit. Innerhalb von Sekunden erhalten Sie eine Bewertung, ob der Lead zu Ihrem Idealkunden passt.",
    faq2Q: "Welche Kommunikationskanäle werden unterstützt?",
    faq2A: "Aclea integriert sich nahtlos mit WhatsApp Business, Gmail, Outlook, Kontaktformularen und vielen weiteren Kanälen. Alle Anfragen werden automatisch in einer zentralen Inbox zusammengeführt.",
    faq3Q: "Kann ich Aclea kostenlos testen?",
    faq3A: "Ja! Wir bieten eine 14-tägige kostenlose Testphase mit vollem Funktionsumfang. Keine Kreditkarte erforderlich. Starten Sie noch heute und erleben Sie, wie viel Zeit Sie sparen können.",
    faq4Q: "Wie sicher sind meine Daten bei Aclea?",
    faq4A: "Datensicherheit hat bei uns höchste Priorität. Alle Daten werden auf deutschen Servern gespeichert und sind DSGVO-konform. Wir verwenden Ende-zu-Ende-Verschlüsselung und regelmäßige Sicherheitsaudits.",
    faq5Q: "Kann ich Aclea mit meinem bestehenden CRM verbinden?",
    faq5A: "Absolut! Aclea bietet native Integrationen mit allen gängigen CRM-Systemen wie HubSpot, Salesforce, Pipedrive und vielen mehr. Über unsere API können Sie auch individuelle Integrationen erstellen.",
    supportText: "Sie finden nicht, wonach Sie suchen? Kontaktieren Sie unser",
    supportTeam: "Support-Team",
    footerProduct: "Produkt",
    footerFeatures: "Funktionen",
    footerPricing: "Preise",
    footerIntegrations: "Integrationen",
    footerAPI: "API",
    footerCompany: "Unternehmen",
    footerAbout: "Über uns",
    footerCareers: "Karriere",
    footerBlog: "Blog",
    footerPress: "Presse",
    footerLegal: "Rechtliches",
    footerImprint: "Impressum",
    footerPrivacy: "Datenschutz",
    footerTerms: "AGB",
    footerCookies: "Cookie-Richtlinie",
    footerSupport: "Support",
    footerHelp: "Hilfe-Center",
    footerContact: "Kontakt",
    footerStatus: "Status",
    footerFAQ: "FAQ",
    footerRights: "Alle Rechte vorbehalten.",
    menuFeatures: "Funktionen",
    menuSolution: "Lösung",
    menuAbout: "Über uns",
    signIn: "Anmelden",
    signUp: "Registrieren",
  },
  en: {
    badge: "AI-Powered Lead Qualification",
    title: "Every Lead. One Place. Instantly Qualified.",
    subtitle: "Stop spending hours evaluating leads that don't fit your business. Aclea centralizes all your inquiries from WhatsApp, Gmail, and other channels - and uses AI to instantly determine if each lead is worth your time.",
    features: "Features",
    powerfulFeatures: "Powerful Features",
    discoverFeatures: "Discover the features that help you spend more time on the leads that really matter.",
    tryFree: "Try for Free",
    aiTitle: "AI-Powered Qualification",
    aiDesc: "Our AI automatically analyzes incoming requests and rates leads in real-time according to over 50 criteria.",
    inboxTitle: "Unified Inbox",
    inboxDesc: "All inquiries from WhatsApp, Gmail, contact forms and more in one central location.",
    gdprTitle: "GDPR Compliant",
    gdprDesc: "All data is stored on German servers and is fully GDPR compliant.",
    notifyTitle: "Real-time Notifications",
    notifyDesc: "Never miss an important lead. Instant notifications for new inquiries.",
    crmTitle: "CRM Integration",
    crmDesc: "Seamless integration with HubSpot, Salesforce, Pipedrive and many more CRM systems.",
    teamTitle: "Team Collaboration",
    teamDesc: "Work efficiently as a team. Assign leads, leave notes and keep track.",
    faqTitle: "Frequently Asked Questions",
    faqDesc: "Find quick and comprehensive answers to common questions about our platform.",
    faq1Q: "How does AI-powered lead qualification work?",
    faq1A: "Our AI automatically analyzes incoming requests based on over 50 criteria, including budget signals, purchase readiness, and industry fit. Within seconds you receive a rating whether the lead matches your ideal customer.",
    faq2Q: "Which communication channels are supported?",
    faq2A: "Aclea integrates seamlessly with WhatsApp Business, Gmail, Outlook, contact forms and many more channels. All inquiries are automatically consolidated in a central inbox.",
    faq3Q: "Can I try Aclea for free?",
    faq3A: "Yes! We offer a 14-day free trial with full functionality. No credit card required. Start today and experience how much time you can save.",
    faq4Q: "How secure is my data with Aclea?",
    faq4A: "Data security is our highest priority. All data is stored on German servers and is GDPR compliant. We use end-to-end encryption and regular security audits.",
    faq5Q: "Can I connect Aclea with my existing CRM?",
    faq5A: "Absolutely! Aclea offers native integrations with all popular CRM systems like HubSpot, Salesforce, Pipedrive and many more. Via our API you can also create custom integrations.",
    supportText: "Can't find what you're looking for? Contact our",
    supportTeam: "Support Team",
    footerProduct: "Product",
    footerFeatures: "Features",
    footerPricing: "Pricing",
    footerIntegrations: "Integrations",
    footerAPI: "API",
    footerCompany: "Company",
    footerAbout: "About Us",
    footerCareers: "Careers",
    footerBlog: "Blog",
    footerPress: "Press",
    footerLegal: "Legal",
    footerImprint: "Imprint",
    footerPrivacy: "Privacy",
    footerTerms: "Terms",
    footerCookies: "Cookie Policy",
    footerSupport: "Support",
    footerHelp: "Help Center",
    footerContact: "Contact",
    footerStatus: "Status",
    footerFAQ: "FAQ",
    footerRights: "All rights reserved.",
    menuFeatures: "Features",
    menuSolution: "Solution",
    menuAbout: "About Us",
    signIn: "Sign In",
    signUp: "Sign Up",
    getStarted: "Get Started",
  }
}

type Language = keyof typeof translations
type TranslationKey = keyof typeof translations.de

function ScrollEffects() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Gradient blobs that move with scroll */}
      <div
        className="fixed top-0 left-0 w-[800px] h-[800px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 60%)',
          transform: `translate(-200px, ${-200 + scrollY * 0.3}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      />
      <div
        className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 60%)',
          transform: `translate(150px, ${100 + scrollY * 0.2}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      />
      <div
        className="fixed bottom-0 left-1/2 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
          transform: `translate(-50%, ${50 - scrollY * 0.4}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      />
      
      {/* Decorative floating shapes */}
      <div
        className="fixed top-1/4 left-10 w-32 h-32 border border-emerald-200/30 rounded-full pointer-events-none"
        style={{
          transform: `translateY(${scrollY * 0.15}px) rotate(${scrollY * 0.02}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
      />
      <div
        className="fixed top-1/3 right-20 w-20 h-20 bg-emerald-100/20 rounded-2xl pointer-events-none"
        style={{
          transform: `translateY(${scrollY * 0.25}px) rotate(${scrollY * -0.03}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
      />
      <div
        className="fixed bottom-1/4 right-1/4 w-16 h-16 border border-blue-200/20 rounded-lg pointer-events-none"
        style={{
          transform: `translateY(${scrollY * 0.35}px) rotate(${scrollY * 0.04}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
      />
      
      {/* Subtle grid that moves with scroll */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          transform: `translateY(${scrollY * 0.5}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      />
    </>
  )
}

export function LandingPage() {
  const [language, setLanguage] = useState<Language>('en')
  const { theme, setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    const stored = localStorage.getItem('language') as Language | null
    if (stored && (stored === 'de' || stored === 'en')) {
      setLanguage(stored)
    }
  }, [])

  const toggleLanguage = () => {
    const newLang = language === 'de' ? 'en' : 'de'
    setLanguage(newLang)
    localStorage.setItem('language', newLang)
  }

  const t = (key: TranslationKey) => translations[language][key]

  return (
    <>
      <HeroHeader t={t} language={language} toggleLanguage={toggleLanguage} theme={resolvedTheme} setTheme={setTheme} />
      <ScrollEffects />
      <HeroGeometric 
        badge={t('badge')}
        title1={t('title').split('.').slice(0,1).join('.')}
        title2={t('title').split('.').slice(1).join('.').replace(/^\s+/, '') || 'Instantly Qualified.'}
      />
      <main className="overflow-hidden bg-[#030303] relative">
        <FeaturesSection t={t} />
        <FAQSection t={t} />
        <Footer t={t} />
      </main>
    </>
  )
}

interface HeroHeaderProps {
  t: (key: TranslationKey) => string
  language: Language
  toggleLanguage: () => void
  theme?: string
  setTheme: (theme: string) => void
}

function HeroHeader({ t, language, toggleLanguage, theme, setTheme }: HeroHeaderProps) {
  const [menuState, setMenuState] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const menuItems = [
    { name: t('menuFeatures'), href: '#funktionen' },
    { name: t('menuSolution'), href: '#link' },
    { name: t('menuAbout'), href: '#link' },
  ]

  return (
    <header>
      <nav className={cn('fixed z-20 w-full px-2 group', menuState && 'active')}>
        <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-500 lg:px-12 border border-white/10 dark:border-white/10 rounded-2xl bg-black/50 backdrop-blur-md', isScrolled && 'bg-black/70 backdrop-blur-lg max-w-4xl border-white/20 lg:px-5')}>
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link href="/" aria-label="Startseite" className="flex items-center space-x-2">
                <Logo />
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? 'Menu schliessen' : 'Menu offnen'}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className={cn('m-auto size-6 transition-transform', menuState && 'rotate-180 scale-0 opacity-0')} />
                <X className={cn('absolute inset-0 m-auto size-6 transition-all -rotate-180 scale-0 opacity-0', menuState && 'rotate-0 scale-100 opacity-100')} />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link href={item.href} className="text-white/80 hover:text-white block duration-150">
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={cn('bg-background mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-4 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none', !menuState && 'lg:group-[.active]:flex')}>
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1"
                aria-label="Toggle language"
              >
                <Globe className="size-5 text-emerald-400" />
                <span className="text-sm font-medium uppercase text-white">{language}</span>
              </button>

              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="size-5 text-amber-400" />
                ) : (
                  <Moon className="size-5 text-white/80" />
                )}
              </button>

              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link href={item.href} className="text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-slate-200 block duration-150">
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Button asChild size="sm" variant={isScrolled ? "default" : "secondary"} className={cn(isScrolled ? "bg-emerald-600 hover:bg-emerald-700" : "bg-emerald-600 hover:bg-emerald-700 text-white", isScrolled && 'lg:hidden')}>
                  <Link href="/login">{t('signIn')}</Link>
                </Button>
                <Button asChild size="sm" className={cn("bg-emerald-600 hover:bg-emerald-700 text-white", isScrolled && 'lg:hidden')}>
                  <Link href="/contact">{t('getStarted')}</Link>
                </Button>
                <Button asChild size="sm" className={cn("bg-emerald-600 hover:bg-emerald-700 text-white", !isScrolled && 'hidden')}>
                  <Link href="/contact">{t('getStarted')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600">
        <Zap className="size-5 text-white" />
      </div>
      <span className="text-lg font-semibold text-white">Aclea</span>
    </div>
  )
}

interface FeaturesSectionProps {
  t: (key: TranslationKey) => string
}

function FeaturesSection({ t }: FeaturesSectionProps) {
  const features = [
    { icon: Zap, titleKey: 'aiTitle' as const, descKey: 'aiDesc' as const },
    { icon: Mail, titleKey: 'inboxTitle' as const, descKey: 'inboxDesc' as const },
    { icon: Shield, titleKey: 'gdprTitle' as const, descKey: 'gdprDesc' as const },
    { icon: Zap, titleKey: 'notifyTitle' as const, descKey: 'notifyDesc' as const },
    { icon: CreditCard, titleKey: 'crmTitle' as const, descKey: 'crmDesc' as const },
    { icon: Heart, titleKey: 'teamTitle' as const, descKey: 'teamDesc' as const },
  ]

  return (
    <section className="py-24 relative" id="funktionen">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-emerald-600/20 bg-emerald-600/10">
            <Zap className="size-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">{t('powerfulFeatures')}</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4 text-balance text-white">
            {t('features')}
          </h2>
          <p className="max-w-2xl mx-auto text-white/60 text-lg">
            {t('discoverFeatures')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/10"
            >
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <feature.icon className="size-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">{t(feature.titleKey)}</h3>
              <p className="text-white/60">{t(feature.descKey)}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link href="/contact" className="gap-2">
              {t('tryFree')}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

interface FAQSectionProps {
  t: (key: TranslationKey) => string
}

function FAQSection({ t }: FAQSectionProps) {
  const faqItems = [
    { id: 'item-1', questionKey: 'faq1Q' as const, answerKey: 'faq1A' as const },
    { id: 'item-2', questionKey: 'faq2Q' as const, answerKey: 'faq2A' as const },
    { id: 'item-3', questionKey: 'faq3Q' as const, answerKey: 'faq3A' as const },
    { id: 'item-4', questionKey: 'faq4Q' as const, answerKey: 'faq4A' as const },
    { id: 'item-5', questionKey: 'faq5Q' as const, answerKey: 'faq5A' as const },
  ]

  return (
    <section className="py-16 md:py-24" id="faq">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="mx-auto max-w-xl text-center mb-12">
          <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl text-white">{t('faqTitle')}</h2>
          <p className="text-white/60 mt-4 text-balance">{t('faqDesc')}</p>
        </div>

        <div className="mx-auto mt-12 max-w-xl space-y-4">
          {faqItems.map((item) => (
            <details key={item.id} className="group rounded-xl border border-white/10 bg-white/5 p-4 open:bg-white/10 transition-colors">
              <summary className="flex items-center justify-between cursor-pointer list-none font-medium text-white">
                {t(item.questionKey)}
                <ChevronDown className="size-5 text-white/50 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-3 text-white/60">{t(item.answerKey)}</p>
            </details>
          ))}
        </div>

        <p className="text-white/60 mt-6 text-center">
          {t('supportText')}{' '}
          <Link href="#kontakt" className="text-emerald-400 font-medium hover:underline">
            {t('supportTeam')}
          </Link>
        </p>
      </div>
    </section>
  )
}

interface FooterProps {
  t: (key: TranslationKey) => string
}

function Footer({ t }: FooterProps) {
  return (
    <footer className="border-t border-white/10 bg-black/50">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600">
                <Zap className="size-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">Aclea</span>
            </Link>
            <p className="mt-4 text-sm text-white/60 max-w-xs">
              {t('subtitle').slice(0, 100)}...
            </p>
            <div className="mt-6 flex flex-col gap-3 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <Mail className="size-4" />
                <span>kontakt@aclea.de</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4" />
                <span>+49 (0) 30 123 456 78</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4" />
                <span>Berlin, Deutschland</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">{t('footerProduct')}</h3>
            <ul className="space-y-3">
              <li><Link href="#funktionen" className="text-sm text-white/60 hover:text-white transition-colors">{t('footerFeatures')}</Link></li>
              <li><Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">{t('footerPricing')}</Link></li>
              <li><Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">{t('footerIntegrations')}</Link></li>
              <li><Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">{t('footerAPI')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">{t('footerCompany')}</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">{t('footerAbout')}</Link></li>
              <li><Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">{t('footerCareers')}</Link></li>
              <li><Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">{t('footerBlog')}</Link></li>
              <li><Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">{t('footerPress')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">{t('footerLegal')}</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">{t('footerImprint')}</Link></li>
              <li><Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">{t('footerPrivacy')}</Link></li>
              <li><Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">{t('footerTerms')}</Link></li>
              <li><Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">{t('footerCookies')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">{t('footerSupport')}</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">{t('footerHelp')}</Link></li>
              <li><Link href="#kontakt" className="text-sm text-white/60 hover:text-white transition-colors">{t('footerContact')}</Link></li>
              <li><Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">{t('footerStatus')}</Link></li>
              <li><Link href="#faq" className="text-sm text-white/60 hover:text-white transition-colors">{t('footerFAQ')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-white/40">
              &copy; {new Date().getFullYear()} Aclea GmbH. {t('footerRights')}
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">
                {t('footerImprint')}
              </Link>
              <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">
                {t('footerPrivacy')}
              </Link>
              <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">
                {t('footerTerms')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
