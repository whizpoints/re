'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  FileText,
  Clock,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Scale,
} from 'lucide-react';
import { NavigationHeader } from '@/components/navigation-header';
import { Footer } from '@/components/footer';

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('acceptance');

  const sections = [
    { id: 'acceptance', title: '1. Acceptance & Authority' },
    { id: 'services', title: '2. Publishing Platform Description' },
    { id: 'accounts', title: '3. Account Security & Verification' },
    { id: 'ownership', title: '4. Content Ownership & License' },
    { id: 'dmca', title: '5. DMCA & Copyright Infringement' },
    { id: 'conduct', title: '6. Acceptable Use & Prohibited Acts' },
    { id: 'expiry', title: '7. Document Lifecycle & Retention' },
    { id: 'sla', title: '8. Service Availability & SLA' },
    { id: 'liability', title: '9. Limitation of Liability' },
    { id: 'indemnity', title: '10. Indemnification' },
    { id: 'governing', title: '11. Governing Law & Arbitration' },
    { id: 'contact', title: '12. Official Contact Information' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <NavigationHeader showFullNav={true} />

      {/* Hero Banner */}
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden border border-slate-800 shadow-xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-medium mb-4">
              <Scale className="w-4 h-4" />
              <span>LEGAL AGREEMENT &bull; EDITION 2026</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
              Terms of Service & Publisher Agreement
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              These Terms of Service constitute a legally binding contractual agreement between you and Whizpoint Solutions governing your access to and use of our digital flipbook publishing suite, WebAssembly imposition engines, vector QR generators, and Cloudflare R2 hosting architecture.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Effective Date: November 12, 2026
              </span>
              <span>&bull;</span>
              <span>Version: 3.1 Commercial</span>
              <span>&bull;</span>
              <span>Enforceable in: Nairobi, Kenya</span>
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
                Terms Index
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
                <div className="text-[11px] text-slate-500 font-medium">Compliance & DMCA:</div>
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
            <section id="acceptance" className="scroll-mt-28 space-y-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                1. Acceptance of Terms & Authority
              </h2>
              <p>
                By creating an account, registering via email or Google Single Sign-On (SSO), uploading any document, or accessing the service, you represent and warrant that:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>You have reached the age of majority in your jurisdiction and possess the legal capacity to enter into a binding contract.</li>
                <li>If you are registering on behalf of a corporation, partnership, or other legal entity, you possess full legal authorization to bind said entity to these Terms.</li>
                <li>You will use the platform strictly in accordance with applicable laws, including copyright and data protection statutes.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section id="services" className="scroll-mt-28 space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                2. Publishing Platform Description
              </h2>
              <p>
                Whizpoint provides an advanced web-based publishing studio facilitating:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li><strong>A3 Booklet Imposition Engine:</strong> Client-side WebAssembly rasterization dividing 2-up landscape A3 spreads into sequentially imposed A4 reading leaves.</li>
                <li><strong>Standard A4 Direct Flow:</strong> 1:1 page extraction without geometric alteration.</li>
                <li><strong>Dynamic Vector QR Codes:</strong> Automated vector QR code generation with centered branding logo.</li>
                <li><strong>Cloudflare R2 Edge Distribution:</strong> Global multi-region edge object storage and content delivery.</li>
              </ul>
              <p className="text-xs text-slate-500">
                Whizpoint reserves the right to modify, upgrade, or refine platform algorithms at any time to preserve high operational standards.
              </p>
            </section>

            {/* Section 3 */}
            <section id="accounts" className="scroll-mt-28 space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                3. Account Security & Verification
              </h2>
              <p>
                To safeguard the integrity of the platform, all publishers must verify their email address before accessing the workspace. You are exclusively responsible for maintaining the confidentiality of your credentials (including passwords and session tokens). Whizpoint Solutions is not liable for unauthorized publications or deletions resulting from compromised user credentials.
              </p>
            </section>

            {/* Section 4 */}
            <section id="ownership" className="scroll-mt-28 space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                4. Content Ownership & Limited License Grant
              </h2>
              <p>
                <strong>You retain 100% ownership of all uploaded content.</strong> Whizpoint does not claim intellectual property rights over any PDF, graphic, text, or publication asset uploaded by you.
              </p>
              <p>
                By uploading content to the platform, you grant Whizpoint Solutions a non-exclusive, worldwide, royalty-free license solely to host, cache, slice, transcode, and display your document across the internet for the explicit purpose of rendering the digital flipbook to your viewers.
              </p>
            </section>

            {/* Section 5 */}
            <section id="dmca" className="scroll-mt-28 space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                5. DMCA & Copyright Infringement Takedown Notice
              </h2>
              <p>
                Whizpoint respects intellectual property rights and adheres to the Digital Millennium Copyright Act (17 U.S.C. &sect; 512) and the Copyright Act of Kenya (Cap. 130).
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <p className="font-semibold text-slate-900">Designated Copyright Agent Contact:</p>
                <p>Email: <code>legal@whizpoint.app</code></p>
                <p>Telephone / WhatsApp: +254 754 783 683 (Alt: +254 718 311 345)</p>
                <p>Attn: Legal & Copyright Department, Whizpoint Solutions, Nairobi, Kenya</p>
                <p className="pt-2 text-slate-600">
                  Any takedown notice must identify the copyrighted work claimed to be infringed, the exact URL slug of the offending publication, and a statement made under penalty of perjury confirming your authorization to act on behalf of the copyright holder.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="conduct" className="scroll-mt-28 space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                6. Acceptable Use & Prohibited Acts
              </h2>
              <p>You strictly agree not to use Whizpoint to:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>Upload documents containing malware, trojans, phishing lures, or malicious scripts.</li>
                <li>Publish defamatory, fraudulent, child-exploitative, or criminally unlawful materials.</li>
                <li>Attempt to reverse engineer, decompile, or tamper with the client-side WebAssembly rasterizer or API endpoints.</li>
                <li>Execute automated scraping, denial of service (DoS), or stress testing without prior written consent.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="expiry" className="scroll-mt-28 space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                7. Document Lifecycle & Automated Purging
              </h2>
              <p>
                Publications hosted on the free tier are governed by a 5-day expiration window from initial publication. Upon expiration, public links redirect to an expiration notice. Retained enterprise publications with custom expiration calendars remain active throughout their authorized tenure. Whizpoint reserves the right to purge orphaned or expired assets from Cloudflare R2 storage to preserve cloud resource hygiene.
              </p>
            </section>

            {/* Section 8 */}
            <section id="sla" className="scroll-mt-28 space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                8. Service Availability & SLA Disclaimers
              </h2>
              <p>
                Whizpoint strives for 99.9% platform availability across its Cloudflare R2 edge delivery network. However, services are provided on an "AS IS" and "AS AVAILABLE" basis. Temporary downtime may occur due to routine scheduled maintenance, upstream edge network disruptions, or emergency security patching.
              </p>
            </section>

            {/* Section 9 */}
            <section id="liability" className="scroll-mt-28 space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                9. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable law, in no event shall Whizpoint Solutions, its directors, employees, or technical partners be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from or related to your use of or inability to use the publishing platform.
              </p>
            </section>

            {/* Section 10 */}
            <section id="indemnity" className="scroll-mt-28 space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                10. Indemnification by Publisher
              </h2>
              <p>
                You agree to defend, indemnify, and hold harmless Whizpoint Solutions, its affiliates, and contractors from and against any third-party claims, liabilities, damages, and legal expenses arising out of your uploaded publications, breach of these Terms, or violation of third-party copyright or privacy rights.
              </p>
            </section>

            {/* Section 11 */}
            <section id="governing" className="scroll-mt-28 space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                11. Governing Law & Dispute Resolution
              </h2>
              <p>
                These Terms are governed by and construed in accordance with the substantive laws of the <strong>Republic of Kenya</strong>. Any controversy, dispute, or claim arising out of or relating to this agreement shall be submitted to confidential arbitration administered in Nairobi, Kenya under the Arbitration Act (Cap. 49) of Kenya.
              </p>
            </section>

            {/* Section 12 */}
            <section id="contact" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                12. Official Contact Information
              </h2>
              <p>For questions or notices regarding these Terms, please reach out to our legal department:</p>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Legal & Compliance</span>
                    <a href="mailto:legal@whizpoint.app" className="text-blue-600 hover:underline">
                      legal@whizpoint.app
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Phone / WhatsApp</span>
                    <a href="https://wa.me/254754783683" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline block">
                      +254 754 783 683
                    </a>
                    <a href="tel:+254718311345" className="text-slate-500 hover:text-slate-800 text-[11px] block mt-0.5">
                      Alt: +254 718 311 345
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
                    <span className="font-bold text-slate-900 block">Headquarters</span>
                    <span className="text-slate-600">Whizpoint Solutions, Nairobi, Kenya</span>
                  </div>
                </div>
              </div>
            </section>

          </main>
        </div>
      </section>

      {/* Universal Whizpoint Light-Mode Footer */}
      <Footer />
    </div>
  );
}
