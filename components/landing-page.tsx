'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { ArrowRight, CreditCard, Heart, Menu, Shield, X, Zap, Mail, Phone, MapPin, Sun, Moon, Globe, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLanguage } from './language-provider'

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

export function LandingPage() {
  const [language, setLanguage] = useState<Language>('de')
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
      <main className="overflow-hidden">
        <div
          aria-hidden
          className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block"
        >
          <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(142,70%,45%,.08)_0,hsla(142,50%,35%,.02)_50%,hsla(142,40%,25%,0)_80%)]" />
          <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(142,70%,45%,.06)_0,hsla(142,40%,25%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(142,70%,45%,.04)_0,hsla(142,40%,25%,.02)_80%,transparent_100%)]" />
        </div>
        <section>
          <div className="relative pt-24 md:pt-36">
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-600/20 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                  <Zap className="size-4" />
                  {t('badge')}
                </div>

                <h1 className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                  {t('title')}
                </h1>
                <p className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground">
                  {t('subtitle')}
                </p>

                <div className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                  <Button asChild size="lg" className="rounded-xl px-8 bg-emerald-600 hover:bg-emerald-700 text-base font-medium">
                    <Link href="/login">
                      <span className="text-nowrap">{t('getStarted')}</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
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
        <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
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
                    <Link href={item.href} className="text-muted-foreground hover:text-accent-foreground block duration-150">
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={cn('bg-background mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-4 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none', !menuState && 'lg:group-[.active]:flex')}>
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer flex items-center gap-1"
                aria-label="Toggle language"
              >
                <Globe className="size-5 text-emerald-600" />
                <span className="text-sm font-medium uppercase">{language}</span>
              </button>

              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="size-5 text-amber-500" />
                ) : (
                  <Moon className="size-5 text-slate-600" />
                )}
              </button>

              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link href={item.href} className="text-muted-foreground hover:text-accent-foreground block duration-150">
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Button asChild variant="outline" size="sm" className={cn(isScrolled && 'lg:hidden')}>
                  <Link href="/login">{t('signIn')}</Link>
                </Button>
                <Button asChild size="sm" className={cn(isScrolled && 'lg:hidden')}>
                  <Link href="/login">{t('signUp')}</Link>
                </Button>
                <Button asChild size="sm" className={cn(!isScrolled && 'hidden')}>
                  <Link href="/login">{t('getStarted')}</Link>
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
      <span className="text-lg font-semibold">Aclea</span>
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
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-emerald-600/20 bg-emerald-600/5">
            <Zap className="size-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-600">{t('powerfulFeatures')}</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4 text-balance">
            {t('features')}
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            {t('discoverFeatures')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border bg-card p-8 transition-all duration-300 hover:border-emerald-600/30 hover:shadow-lg hover:shadow-emerald-600/5"
            >
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <feature.icon className="size-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{t(feature.titleKey)}</h3>
              <p className="text-muted-foreground">{t(feature.descKey)}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg" className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
            <Link href="/login" className="gap-2">
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
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">{t('faqTitle')}</h2>
          <p className="text-muted-foreground mt-4 text-balance">{t('faqDesc')}</p>
        </div>

        <div className="mx-auto mt-12 max-w-xl space-y-4">
          {faqItems.map((item) => (
            <details key={item.id} className="group rounded-xl border bg-card p-4 open:shadow-md transition-shadow">
              <summary className="flex items-center justify-between cursor-pointer list-none font-medium">
                {t(item.questionKey)}
                <div className="size-5 flex items-center justify-center rounded-full bg-muted group-open:rotate-180 transition-transform">
                  <X className="size-3" />
                </div>
              </summary>
              <p className="mt-3 text-muted-foreground">{t(item.answerKey)}</p>
            </details>
          ))}
        </div>

        <p className="text-muted-foreground mt-6 text-center">
          {t('supportText')}{' '}
          <Link href="#kontakt" className="text-emerald-600 font-medium hover:underline">
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
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600">
                <Zap className="size-5 text-white" />
              </div>
              <span className="text-lg font-semibold">Aclea</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              {t('subtitle').slice(0, 100)}...
            </p>
            <div className="mt-6 flex flex-col gap-3 text-sm text-muted-foreground">
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
            <h3 className="font-semibold mb-4">{t('footerProduct')}</h3>
            <ul className="space-y-3">
              <li><Link href="#funktionen" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footerFeatures')}</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footerPricing')}</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footerIntegrations')}</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footerAPI')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('footerCompany')}</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footerAbout')}</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footerCareers')}</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footerBlog')}</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footerPress')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('footerLegal')}</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footerImprint')}</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footerPrivacy')}</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footerTerms')}</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footerCookies')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('footerSupport')}</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footerHelp')}</Link></li>
              <li><Link href="#kontakt" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footerContact')}</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footerStatus')}</Link></li>
              <li><Link href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footerFAQ')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Aclea GmbH. {t('footerRights')}
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('footerImprint')}
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('footerPrivacy')}
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('footerTerms')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
