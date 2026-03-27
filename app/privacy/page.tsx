'use client'

import Link from 'next/link'
import { ArrowLeft, Zap, Mail, Shield, Eye, Lock, Users, Trash2 } from 'lucide-react'

export default function PrivacyPage() {
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

          <h1 className="text-3xl md:text-4xl font-bold mb-8">Datenschutzerklärung</h1>

          <div className="space-y-6 text-white/80">
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="size-6 text-emerald-400" />
                <h2 className="text-xl font-semibold text-white">1. Einleitung</h2>
              </div>
              <p className="mb-4">
                Wir freuen uns über Ihr Interesse an unserer Webseite und unserem Service Aclea. 
                Der Schutz Ihrer personenbezogenen Daten ist uns ein wichtiges Anliegen. 
                Mit dieser Datenschutzerklärung informieren wir Sie umfassend über die Verarbeitung 
                Ihrer personenbezogenen Daten.
              </p>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="size-6 text-emerald-400" />
                <h2 className="text-xl font-semibold text-white">2. Verantwortlicher</h2>
              </div>
              <p className="mb-4">Verantwortlich für die Datenverarbeitung ist:</p>
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="mb-2"><strong>Aclea GmbH</strong></p>
                <p className="mb-2">Friedrichstraße 123</p>
                <p className="mb-2">10117 Berlin</p>
                <p className="mb-2">Deutschland</p>
                <p className="flex items-center gap-2 mt-4">
                  <Mail className="size-4 text-emerald-400" />
                  E-Mail: datenschutz@aclea.de
                </p>
              </div>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Users className="size-6 text-emerald-400" />
                <h2 className="text-xl font-semibold text-white">3. Erhobene Daten</h2>
              </div>
              <p className="mb-4">Wir erheben und verarbeiten folgende personenbezogene Daten:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Kontaktdaten:</strong> Name, E-Mail-Adresse, Telefonnummer, Unternehmensname</li>
                <li><strong>Nutzungsdaten:</strong> IP-Adresse, Browsertyp, Zugriffszeiten, besuchte Seiten</li>
                <li><strong>Lead-Daten:</strong> Informationen über potenzielle Kunden, die Sie importieren</li>
                <li><strong>Kommunikationsdaten:</strong> Nachrichten, die Sie über unser System senden</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">4. Zweck der Datenverarbeitung</h2>
              <p className="mb-4">Wir verarbeiten Ihre Daten zu folgenden Zwecken:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Bereitstellung und Verbesserung unserer Dienste</li>
                <li>Kommunikation mit Ihnen</li>
                <li>Analyse und Optimierung unseres Angebots</li>
                <li>Erfüllung vertraglicher Pflichten</li>
                <li>Einhaltung rechtlicher Verpflichtungen</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">5. Rechtsgrundlage</h2>
              <p className="mb-4">Die Verarbeitung Ihrer Daten erfolgt auf Grundlage von:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Art. 6 Abs. 1 lit. b DSGVO:</strong> Erfüllung eines Vertrags oder vorvertraglicher Maßnahmen</li>
                <li><strong>Art. 6 Abs. 1 lit. f DSGVO:</strong> Berechtigte Interessen (z.B. Verbesserung unserer Dienste)</li>
                <li><strong>Art. 6 Abs. 1 lit. c DSGVO:</strong> Erfüllung rechtlicher Verpflichtungen</li>
                <li><strong>Art. 6 Abs. 1 lit. a DSGVO:</strong> Ihre Einwilligung (z.B. Newsletter)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">6. Datenübertragung</h2>
              <p className="mb-4">
                Ihre Daten können an folgende Empfänger übermittelt werden:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Hosting-Dienstleister (Server in Deutschland)</li>
                <li>Cloud-Dienstleister für Datenspeicherung</li>
                <li>Zahlungsdienstleister</li>
                <li>Analysetools</li>
              </ul>
              <p className="mt-4">
                Eine Übermittlung Ihrer Daten in Drittländer außerhalb der EU/EWR findet nicht statt.
              </p>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="size-6 text-emerald-400" />
                <h2 className="text-xl font-semibold text-white">7. Datensicherheit</h2>
              </div>
              <p className="mb-4">
                Wir treffen technische und organisatorische Maßnahmen zum Schutz Ihrer Daten, 
                einschließlich:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Verschlüsselung (SSL/TLS) bei der Datenübertragung</li>
                <li>Sichere Speicherung auf Servern in Deutschland</li>
                <li>Zugangskontrollen und Berechtigungskonzepte</li>
                <li>Regelmäßige Sicherheitsüberprüfungen</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Trash2 className="size-6 text-emerald-400" />
                <h2 className="text-xl font-semibold text-white">8. Speicherdauer</h2>
              </div>
              <p className="mb-4">
                Wir speichern Ihre personenbezogenen Daten nur solange, wie es für die 
                Erfüllung der genannten Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen 
                bestehen. Nach Ablauf der Fristen werden die Daten gelöscht.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">9. Ihre Rechte</h2>
              <p className="mb-4">Sie haben folgende Rechte:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Auskunft (Art. 15 DSGVO):</strong> Recht auf Auskunft über Ihre gespeicherten Daten</li>
                <li><strong>Berichtigung (Art. 16 DSGVO):</strong> Recht auf Berichtigung unrichtiger Daten</li>
                <li><strong>Löschung (Art. 17 DSGVO):</strong> Recht auf Löschung Ihrer Daten</li>
                <li><strong>Einschränkung (Art. 18 DSGVO):</strong> Recht auf Einschränkung der Verarbeitung</li>
                <li><strong>Datenübertragbarkeit (Art. 20 DSGVO):</strong> Recht auf Übertragung Ihrer Daten</li>
                <li><strong>Widerspruch (Art. 21 DSGVO):</strong> Recht auf Widerspruch gegen die Verarbeitung</li>
                <li><strong>Widerruf (Art. 7 Abs. 3 DSGVO):</strong> Widerruf einer Einwilligung</li>
              </ul>
              <p className="mt-4">
                Um Ihre Rechte auszuüben, kontaktieren Sie uns unter datenschutz@aclea.de.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">10. Beschwerderecht</h2>
              <p className="mb-4">
                Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die 
                Verarbeitung Ihrer personenbezogenen Daten durch uns zu beschweren.
              </p>
              <p>
                Zuständige Aufsichtsbehörde:<br />
                Berliner Beauftragte für Datenschutz und Informationsfreiheit<br />
                Alt-Moabit 59-61, 10555 Berlin<br />
                Telefon: +49 30 13889-0
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">11. Änderungen</h2>
              <p className="mb-4">
                Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen. 
                Die aktuelle Version ist stets auf dieser Seite verfügbar.
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
