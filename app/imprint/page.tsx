'use client'

import Link from 'next/link'
import { ArrowLeft, Zap, Mail, Phone, MapPin } from 'lucide-react'

export default function ImprintPage() {
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
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-8">Impressum</h1>

          <div className="space-y-6 text-white/80">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Angaben gemäß § 5 TMG</h2>
              <p className="mb-2">Aclea GmbH</p>
              <p className="mb-2">Friedrichstraße 123</p>
              <p className="mb-2">10117 Berlin</p>
              <p className="mb-4">Deutschland</p>
              
              <p className="mb-2"><strong>Geschäftsführer:</strong> Max Mustermann</p>
              <p className="mb-2"><strong>Handelsregister:</strong> Amtsgericht Berlin (Charlottenburg)</p>
              <p className="mb-2"><strong>Registernummer:</strong> HRB 123456</p>
              <p className="mb-2"><strong>USt-IdNr.:</strong> DE123456789</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Kontakt</h2>
              <p className="mb-2 flex items-center gap-2">
                <Mail className="size-4 text-emerald-400" />
                E-Mail: kontakt@aclea.de
              </p>
              <p className="mb-2 flex items-center gap-2">
                <Phone className="size-4 text-emerald-400" />
                Telefon: +49 (0) 30 123 456 78
              </p>
              <p className="mb-2 flex items-center gap-2">
                <MapPin className="size-4 text-emerald-400" />
                Adresse: Friedrichstraße 123, 10117 Berlin
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Haftung für Inhalte</h2>
              <p className="mb-4">
                Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, 
                Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. 
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten 
                nach den allgemeinen Gesetzen verantwortlich.
              </p>
              <p className="mb-4">
                Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter nicht verpflichtet, übermittelte 
                oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die 
                auf eine rechtswidrige Tätigkeit hinweisen.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Haftung für Links</h2>
              <p className="mb-4">
                Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen 
                Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
                Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber 
                der Seiten verantwortlich.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Urheberrecht</h2>
              <p className="mb-4">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
                dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art 
                der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen 
                Zustimmung des jeweiligen Autors bzw. Erstellers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Streitschlichtung</h2>
              <p className="mb-4">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
                <a href="https://ec.europa.eu/consumers/odr" className="text-emerald-400 hover:underline ml-1">
                  https://ec.europa.eu/consumers/odr
                </a>
              </p>
              <p className="mb-4">
                Zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle 
                sind wir nicht verpflichtet und nicht bereit.
              </p>
            </section>

            <p className="text-sm text-white/40 mt-12">
              Stand: {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-black/50 py-8 px-6">
        <div className="max-w-4xl mx-auto text-center text-white/40 text-sm">
          &copy; {new Date().getFullYear()} Aclea GmbH. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  )
}
