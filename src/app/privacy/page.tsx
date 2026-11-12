'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  FileText,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { NavigationHeader } from '@/components/navigation-header';

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: '1. Overview & Data Controller' },
    { id: 'statutory', title: '2. Kenya Data Protection Act 2019' },
    { id: 'gdpr', title: '3. GDPR & International Transfers' },
    { id: 'ccpa', title: '4. CCPA / CPRA Disclosures' },
    { id: 'collection', title: '5. Information We Collect' },
    { id: 'processing', title: '6. Lawful Basis & Usage' },
    { id: 'storage', title: '7. Storage Security & Encryption' },
    { id: 'retention', title: '8. Document Retention & Expiry' },
    { id: 'rights', title: '9. Your Statutory Data Rights' },
    { id: 'cookies', title: '10. Cookies & Telemetry' },
    { id: 'contact', title: '11. Legal Inquiries & Contacts' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <NavigationHeader showFullNav={true} />

      {/* Hero Banner */}
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden border border-slate-800 shadow-xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-medium mb-4">
              <ShieldCheck className="w-4 h-4" />
              <span>REGULATORY COMPLIANCE &bull; EDITION 2026</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
              Privacy Policy & Data Protection Charter
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Whizpoint Solutions is strictly committed to protecting personal data, digital publications, and user privacy in accordance with the Kenya Data Protection Act (KDPA) 2019, the General Data Protection Regulation (GDPR), and international data privacy statutes.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Effective Date: November 12, 2026
              </span>
              <span>&bull;</span>
              <span>Version: 3.1 Enterprise</span>
              <span>&bull;</span>
              <span>Jurisdiction: Republic of Kenya</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Two-Column Reader */}
      <section className="flex-1 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sticky Table of Contents */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-28 bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1">
              <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest px-3 py-2 mb-1">
                Sections Index
              </div>
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  onClick={() => setActiveSection(sec.id)}
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeSection === sec.id
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {sec.title}
                </a>
              ))}

              <div className="pt-4 mt-4 border-t border-slate-100 px-3">
                <div className="text-[11px] text-slate-500 font-medium">Statutory Inquiries:</div>
                <a
                  href="mailto:legal@whizpoint.app"
                  className="text-xs text-blue-600 font-semibold hover:underline block mt-0.5"
                >
                  legal@whizpoint.app
                </a>
              </div>
            </div>
          </aside>

          {/* Right Detailed Legal Content */}
          <main className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 lg:p-12 shadow-sm space-y-10 text-slate-700 leading-relaxed text-sm">
            
            {/* Section 1 */}
            <section id="overview" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                1. Overview & Data Controller
              </h2>
              <p>
                This Privacy Policy governs the manner in which Whizpoint Solutions ("Whizpoint", "we", "our", or "us"), a technology provider operating under the commercial laws of the Republic of Kenya, collects, processes, maintains, stores, and discloses information collected from users ("Publishers", "Readers", or "You") of our digital flipbook publishing platform (accessible via <code>https://e.whizpoint.app</code> and associated subdomains).
              </p>
              <p>
                For the purposes of applicable data protection legislation, Whizpoint Solutions acts as the <strong>Data Controller</strong> with respect to user account credentials, billing information, and system telemetry, and as a <strong>Data Processor</strong> with respect to document contents and customer-uploaded publications processed on behalf of publishers.
              </p>
            </section>

            {/* Section 2 */}
            <section id="statutory" className="scroll-mt-28 space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>2. Kenya Data Protection Act 2019 Compliance</span>
              </h2>
              <p>
                In compliance with the Kenya Data Protection Act, No. 24 of 2019, and the regulations enacted by the Office of the Data Protection Commissioner (ODPC) Kenya, Whizpoint ensures that:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>Personal data is processed lawfully, fairly, and in a transparent manner in relation to the data subject.</li>
                <li>Data is collected for explicit, specified, and legitimate digital publishing purposes and not further processed in a manner incompatible with those purposes.</li>
                <li>Data is adequate, relevant, and limited to what is strictly necessary in relation to the purposes for which it is processed (data minimization).</li>
                <li>Appropriate technical and organizational measures are implemented to protect personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="gdpr" className="scroll-mt-28 space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                3. European Union GDPR & UK GDPR Compliance
              </h2>
              <p>
                For individuals residing in the European Economic Area (EEA) and the United Kingdom, Whizpoint adheres to Regulation (EU) 2016/679 (GDPR). Our lawful bases for processing personal information include:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li><strong>Contractual Performance:</strong> Fulfilling our obligation to render interactive flipbook rendering, QR generation, and publication hosting services.</li>
                <li><strong>Legitimate Interests:</strong> Operating platform security telemetry, preventing brute force attacks, and verifying publisher identities.</li>
                <li><strong>Explicit Consent:</strong> Sending service updates, product notifications, and transactional verification emails.</li>
              </ul>
              <p>
                Cross-border transfers of personal data are secured using European Commission approved Standard Contractual Clauses (SCCs) and robust cryptographic controls.
              </p>
            </section>

            {/* Section 4 */}
            <section id="ccpa" className="scroll-mt-28 space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                4. California Consumer Privacy Act (CCPA / CPRA)
              </h2>
              <p>
                Under the California Consumer Privacy Act, as amended by the California Privacy Rights Act (CPRA), California residents are entitled to specific disclosures:
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <p><strong>Notice of Non-Sale:</strong> Whizpoint does NOT sell, rent, lease, or trade personal data or publication readership metrics to third parties or advertising data brokers for monetary or other valuable consideration.</p>
                <p><strong>Right to Limit:</strong> You have the absolute right to limit the use of any sensitive personal information collected solely to that necessary for delivering the application.</p>
              </div>
            </section>

            {/* Section 5 */}
            <section id="collection" className="scroll-mt-28 space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                5. Information We Collect
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-900 block text-sm">Account Information</span>
                  <p className="text-slate-600">Full name, company identifier, verified email address, hashed passwords (bcrypt salts with high computational factor), and Google OAuth unique identifiers.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-900 block text-sm">Publication Assets</span>
                  <p className="text-slate-600">PDF source files, extracted WebP image assets, dynamic vector QR codes, custom publication titles, page impositions, and custom expiration dates.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-900 block text-sm">Readership Telemetry</span>
                  <p className="text-slate-600">Aggregated publication view counts, referrers, device viewport ratios (mobile vs. desktop), and interaction timestamps without persistent invasive profiling.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-900 block text-sm">Security Logs</span>
                  <p className="text-slate-600">IP addresses, reverse-proxy forwarding headers (e.g. Cloudflare tunnels), user-agent strings, and request latency for threat detection.</p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="processing" className="scroll-mt-28 space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                6. Lawful Basis & Usage
              </h2>
              <p>We process your personal information exclusively for sanctioned business operations:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>Operating client-side WebAssembly rendering for A3 booklet spreads and A4 documents.</li>
                <li>Dispatching transactional emails, including account activations, password resets, and publication readiness notices via Brevo SMTP relay.</li>
                <li>Enforcing publication lifecycle policies and security perimeter access controls.</li>
                <li>Conducting anonymous operational analytics to optimize edge delivery speed.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="storage" className="scroll-mt-28 space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                7. Storage Security & Encryption Standards
              </h2>
              <p>
                Whizpoint implements defense-in-depth security architectures:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li><strong>Encryption at Rest:</strong> All document pages and image slices stored on Cloudflare R2 and AWS S3 infrastructure are encrypted with AES-256 GCM encryption.</li>
                <li><strong>Encryption in Transit:</strong> All HTTP interactions strictly require Transport Layer Security (TLS 1.3 / TLS 1.2) with strict HSTS preloading.</li>
                <li><strong>Keystore Integrity:</strong> JSON Web Tokens (JWT) are signed using 256-bit cryptographic secrets with short expiration lifespans.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="retention" className="scroll-mt-28 space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                8. Document Retention & Automated Expiry
              </h2>
              <p>
                Whizpoint provides configurable document retention parameters:
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <p><strong>Free-Tier Automatic Expiry:</strong> Unless customized by a verified publisher, free-tier temporary publications automatically expire after 5 calendar days from initial upload, upon which public viewing access is revoked.</p>
                <p><strong>Persistent Publications:</strong> Publishers with assigned enterprise retainers retain publications indefinitely or until deliberate manual deletion via the Publisher Studio.</p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="rights" className="scroll-mt-28 space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                9. Your Statutory Data Rights
              </h2>
              <p>Under statutory data protection laws, you retain the following guaranteed rights:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block">Right of Access</span>
                  <span>Request full disclosure of all personal data held about your account.</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block">Right to Rectification</span>
                  <span>Correct inaccurate, misleading, or outdated personal records.</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block">Right to Erasure ("To Be Forgotten")</span>
                  <span>Request permanent deletion of your account and all associated documents.</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block">Right to Data Portability</span>
                  <span>Receive an export of your documents and assets in a machine-readable format.</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 pt-2">
                To exercise any of these statutory rights, please submit a formal request to our designated Data Protection Officer at <code>legal@whizpoint.app</code>. We respond within 30 statutory days.
              </p>
            </section>

            {/* Section 10 */}
            <section id="cookies" className="scroll-mt-28 space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                10. Cookies & Essential Client Storage
              </h2>
              <p>
                Whizpoint does not utilize intrusive third-party cross-site advertising tracking cookies. We utilize strictly necessary local client storage (such as <code>localStorage</code>) exclusively for maintaining authenticated publisher sessions (<code>auth_token</code>) and reader display preferences.
              </p>
            </section>

            {/* Section 11 */}
            <section id="contact" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                11. Legal Inquiries & Official Contacts
              </h2>
              <p>
                If you have questions, regulatory submissions, or concerns regarding this Privacy Policy or our data protection practices, please contact our legal counsel:
              </p>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Legal & Data Protection Officer</span>
                    <a href="mailto:legal@whizpoint.app" className="text-blue-600 hover:underline">
                      legal@whizpoint.app
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Direct Telephone</span>
                    <a href="tel:+254718311345" className="text-slate-700 hover:text-blue-600">
                      +254 718 311 345
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Publisher Support</span>
                    <a href="mailto:support@whizpoint.app" className="text-blue-600 hover:underline">
                      support@whizpoint.app
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Registered Headquarters</span>
                    <span className="text-slate-600">Whizpoint Solutions, Nairobi, Kenya</span>
                  </div>
                </div>
              </div>
            </section>

          </main>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Whizpoint Solutions. All rights reserved. Kenya Data Protection Act Compliant.</p>
      </footer>
    </div>
  );
}
