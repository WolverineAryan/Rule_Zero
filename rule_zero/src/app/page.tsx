'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// --- SVG Icons for the 3D Particle System ---
const ICONS = [
  <svg key="scale" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18l-7 7m7-7l7 7M5 10v4a7 7 0 0014 0v-4M8 14h8" /></svg>,
  <svg key="chakra" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M4.9 19.1L19.1 4.9M7.5 3.5l9 17M3.5 7.5l17 9M3.5 16.5l17-9M7.5 20.5l9-17" /></svg>,
  <svg key="gavel" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M14 13l-4 4m0 0l-4-4m4 4v7m6-11l-4-4m0 0L8 6m4-4v7m5 6h4m-4 0a2 2 0 11-4 0 2 2 0 014 0zM5 11h4m-4 0a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  <svg key="doc" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  <svg key="shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
];

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const generatedParticles = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1.5, 
      opacity: Math.random() * 0.1 + 0.03, 
      animationDuration: Math.random() * 20 + 25, 
      animationDelay: Math.random() * -40, 
      zTranslate: Math.random() * 600 - 300, 
      iconIndex: Math.floor(Math.random() * ICONS.length),
      rotationDir: Math.random() > 0.5 ? 1 : -1,
    }));
    setParticles(generatedParticles);

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f4f0] font-sans text-neutral-900 selection:bg-[#ffc900] selection:text-black overflow-x-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float3D {
          0% { transform: translateY(0) translateZ(var(--tz)) rotate(0deg); }
          50% { transform: translateY(-80px) translateZ(calc(var(--tz) + 40px)) rotate(calc(180deg * var(--rd))); }
          100% { transform: translateY(0) translateZ(var(--tz)) rotate(calc(360deg * var(--rd))); }
        }
      `}} />

      {/* 🚀 SECTION 1: HERO */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 px-6 overflow-hidden min-h-[85vh] flex flex-col items-center justify-center">
        <div className="absolute inset-0 z-0 overflow-hidden" style={{ perspective: '1000px' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f4f4f0]/60 to-[#f4f4f0] z-20 pointer-events-none"></div>
          <div className="absolute inset-0 z-10" style={{ transformStyle: 'preserve-3d' }}>
            {particles.map((p) => (
              <div 
                key={p.id}
                className="absolute text-neutral-400"
                style={{
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  width: `${p.size}rem`,
                  height: `${p.size}rem`,
                  opacity: p.opacity,
                  // @ts-ignore
                  '--tz': `${p.zTranslate}px`,
                  '--rd': p.rotationDir,
                  animation: `float3D ${p.animationDuration}s infinite ease-in-out`,
                  animationDelay: `${p.animationDelay}s`,
                }}
              >
                {ICONS[p.iconIndex]}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-30 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 text-neutral-600 text-xs font-bold tracking-widest uppercase mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#ffc900] animate-pulse"></span>
            The Indian Legislative OS
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-black mb-6 leading-none">
            RULE_ZERO<span className="text-[#ffc900]">.</span>
          </h1>
          
          <h2 className="text-2xl md:text-4xl font-bold text-neutral-700 mb-6 tracking-tight">
            The Gazette of India, <span className="bg-[#ffc900] text-black px-3 py-1 rounded-lg inline-block mt-2 md:mt-0">Decoded & Computed.</span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-base md:text-lg text-neutral-600 mb-10 leading-relaxed font-medium">
            Navigating the Indian regulatory landscape is no longer a bottleneck. Whether you are a scaling enterprise in Nashik or a citizen mapping your rights, Rule_Zero translates complex legal frameworks into high-speed, actionable compliance playbooks.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <Link href="/explore" className="px-8 py-4 bg-black text-white font-bold rounded-xl shadow-lg hover:bg-neutral-800 hover:-translate-y-0.5 transition-all tracking-wide">
                Access Audit Terminal
              </Link>
            ) : (
              <>
                <Link href="/signup" className="px-8 py-4 bg-[#ffc900] text-black font-bold rounded-xl shadow-lg shadow-yellow-500/20 hover:bg-[#e6b500] hover:-translate-y-0.5 transition-all tracking-wide">
                  Start Free Audit
                </Link>
                <Link href="/explore" className="px-8 py-4 bg-white text-neutral-900 font-bold rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-neutral-300 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 tracking-wide">
                  Browse Law Vault <span className="text-xl">→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 🚀 SECTION 2: THE CRISIS */}
      <section className="py-20 px-6 bg-white border-y border-neutral-200">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-black mb-6 leading-tight">
                India's Regulatory Framework is Expanding. <br/>
                <span className="text-neutral-400">Are you compliant?</span>
              </h2>
              <p className="text-neutral-600 mb-6 leading-relaxed">
                The Indian government is rapidly modernizing digital infrastructure. With the introduction of the Digital Personal Data Protection (DPDP) Act 2023 and the updated Information Technology guidelines, the liability on modern digital businesses has never been higher.
              </p>
              <p className="text-neutral-600 leading-relaxed">
                Rule_Zero isolates your specific business model and strips away thousands of irrelevant clauses, leaving you with exactly what the Ministry of Law & Justice requires from you.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f4f4f0] border border-neutral-200 p-6 rounded-2xl text-center md:text-left">
                <h4 className="text-3xl font-black text-black mb-1">₹250Cr</h4>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Max Penalty</p>
              </div>
              <div className="bg-[#f4f4f0] border border-neutral-200 p-6 rounded-2xl text-center md:text-left">
                <h4 className="text-3xl font-black text-black mb-1">500+</h4>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Pages Indexed</p>
              </div>
              <div className="bg-[#f4f4f0] border border-neutral-200 p-6 rounded-2xl text-center md:text-left">
                <h4 className="text-3xl font-black text-black mb-1">100%</h4>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Audit Ready</p>
              </div>
              <div className="bg-[#ffc900] border border-[#e6b500] p-6 rounded-2xl text-center md:text-left shadow-inner">
                <h4 className="text-3xl font-black text-black mb-1">0</h4>
                <p className="text-xs font-bold text-neutral-800 uppercase tracking-wide">Legal Jargon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 SECTION 3: WHO IS THIS FOR? (Targeted Use Cases) */}
      <section className="py-20 px-6 bg-[#f4f4f0]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-black mb-4">Precision Playbooks for Modern Startups</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">Different business models trigger entirely different legal liabilities. Select your sector to generate targeted audits.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-neutral-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-6 text-xl">🛒</div>
              <h3 className="text-xl font-black text-black mb-3">E-Commerce & Retail</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Ensure compliance with the Consumer Protection Rules 2020. Perfect for platforms dealing with digital inventory, refurbished hardware warranties, and marketplace grievance redressal.
              </p>
            </div>
            
            <div className="bg-white border border-neutral-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-6 text-xl">💻</div>
              <h3 className="text-xl font-black text-black mb-3">App Developers</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Whether you are deploying Kotlin backends or Angular web interfaces, ensure your data pipelines and API endpoints legally comply with the DPDP Act's strict data fiduciary guidelines.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-6 text-xl">🎮</div>
              <h3 className="text-xl font-black text-black mb-3">Game Development</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Navigate the specific legalities of virtual economies, in-game currency, digital item procurement, and age-gating mechanisms required by the Ministry of Electronics and IT.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 SECTION 4: CORE LEGISLATIONS (Expanded) */}
      <section className="py-20 px-6 bg-black text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Indexed Indian Legislations</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">Continuously updated to reflect the latest Gazette notifications and regulatory shifts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl hover:border-neutral-700 transition-colors">
              <span className="bg-[#ffc900] text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Act No. 22 of 2023</span>
              <h3 className="text-xl font-bold mt-4 mb-3">Digital Personal Data Protection Act, 2023</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">Mandatory compliance for any entity collecting digital data. Decodes Data Fiduciary obligations, verifiable parental consent, and right to erasure.</p>
            </div>
            
            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl hover:border-neutral-700 transition-colors">
              <span className="bg-[#ffc900] text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Act No. 21 of 2000</span>
              <h3 className="text-xl font-bold mt-4 mb-3">The Information Technology Act, 2000</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">The foundational law for cyber security in India. Decodes requirements for electronic contracts, digital signatures, and intermediary liability.</p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl hover:border-neutral-700 transition-colors">
              <span className="bg-[#ffc900] text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">G.S.R. 462(E)</span>
              <h3 className="text-xl font-bold mt-4 mb-3">Consumer Protection (E-Commerce) Rules</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">Essential for retail platforms. Decodes guidelines for marketplace vs inventory models, mandatory product origin displays, and cancellation policies.</p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl hover:border-neutral-700 transition-colors">
              <span className="bg-[#ffc900] text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">G.S.R. 801(E)</span>
              <h3 className="text-xl font-bold mt-4 mb-3">E-Waste (Management) Rules, 2022</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">Critical for hardware manufacturers and refurbished electronics platforms. Outlines Extended Producer Responsibility (EPR) and disposal frameworks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 SECTION 5: THE TECHNICAL PIPELINE */}
      <section className="py-20 px-6 bg-[#f4f4f0] border-y border-neutral-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-black mb-4">From Raw Law to Final PDF</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">A systematic, repeatable infrastructure for maintaining corporate governance.</p>
          </div>

          <div className="space-y-16 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-neutral-200">
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#f4f4f0] bg-[#ffc900] text-black font-black shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">1</div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white border border-neutral-200 p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-black mb-2">Isolate Context</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">Select your specific domain. The system dynamically filters the database to show only legally binding clauses for your sector, omitting irrelevant noise.</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#f4f4f0] bg-[#ffc900] text-black font-black shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">2</div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white border border-neutral-200 p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-black mb-2">AI Translation Protocol</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">Our system processes complex parliamentary language through a targeted AI translation layer, converting deep legalese into standard operational tasks.</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#f4f4f0] bg-[#ffc900] text-black font-black shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">3</div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white border border-neutral-200 p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-black mb-2">Cloud-Synced Export</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">Check off requirements as you build. Export a structured, color-coded PDF report to instantly verify your compliance standing to investors or legal advisors.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🚀 SECTION 6: FAQ (New Content) */}
      <section className="py-20 px-6 bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-black mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-[#f4f4f0] border border-neutral-200 rounded-2xl">
              <h4 className="text-lg font-bold text-black mb-2">Does Rule_Zero replace a corporate lawyer?</h4>
              <p className="text-neutral-600 text-sm leading-relaxed">No. Rule_Zero is an educational and preliminary audit tool designed to give founders and citizens a massive head start. It translates requirements so you know exactly what to build, but you should always consult a registered advocate for binding legal counsel.</p>
            </div>
            
            <div className="p-6 bg-[#f4f4f0] border border-neutral-200 rounded-2xl">
              <h4 className="text-lg font-bold text-black mb-2">Are the AI translations accurate?</h4>
              <p className="text-neutral-600 text-sm leading-relaxed">Yes. Our pipeline is strictly constrained to standard English translations of the original text. It does not "hallucinate" new laws; it merely simplifies the vocabulary and structure of the existing clauses published in the Gazette of India.</p>
            </div>

            <div className="p-6 bg-[#f4f4f0] border border-neutral-200 rounded-2xl">
              <h4 className="text-lg font-bold text-black mb-2">Where is my audit data saved?</h4>
              <p className="text-neutral-600 text-sm leading-relaxed">Your progress (which clauses you have checked off) is securely saved to an encrypted cloud PostgreSQL database. We do not store your proprietary business logic, only your structural compliance score.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 SECTION 7: DUAL LENS ARCHITECTURE */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-black mb-4">Two Modes of Operation</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">Select the environment tailored to your current legal objective.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white border border-neutral-200 p-10 rounded-3xl shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#f4f4f0] text-neutral-600 text-xs font-bold uppercase tracking-wider mb-6">
                Mode 01 // Citizen
              </div>
              <h3 className="text-3xl font-black text-black mb-4">Civic Encyclopedia</h3>
              <p className="text-neutral-600 leading-relaxed mb-8 text-sm">
                Stop guessing your constitutional rights. Browse raw legal clauses instantly rewritten into plain English. Understand your rights during consumer disputes and digital data breaches.
              </p>
            </div>
            <Link href="/explore" className="w-full text-center px-6 py-4 bg-[#f4f4f0] text-black font-bold rounded-xl border border-neutral-200 hover:bg-neutral-200 transition-colors">
              Enter Civic Mode
            </Link>
          </div>

          <div className="bg-black border border-neutral-800 p-10 rounded-3xl shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-900 text-[#ffc900] border border-neutral-800 text-xs font-bold uppercase tracking-wider mb-6">
                Mode 02 // Enterprise
              </div>
              <h3 className="text-3xl font-black text-white mb-4">Startup Playbooks</h3>
              <p className="text-neutral-400 leading-relaxed mb-8 text-sm">
                Designed for founders. Lock down explicit legal liability loops for your platform or studio. Track real-time compliance to ensure you are ready for due diligence and Series A funding.
              </p>
            </div>
            <Link href={user ? "/explore" : "/login"} className="relative z-10 w-full text-center px-6 py-4 bg-[#ffc900] text-black font-bold rounded-xl hover:bg-[#e6b500] shadow-lg shadow-yellow-900/20 transition-colors">
              Launch Audit Terminal
            </Link>
          </div>

        </div>
      </section>

      {/* 🚀 FOOTER */}
      <footer className="bg-white border-t border-neutral-200 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-black tracking-tight text-black">RULE_ZERO<span className="text-[#ffc900]">.</span></h2>
            <p className="text-neutral-500 text-xs mt-2 font-medium">The Indian Legislative Operating System.</p>
          </div>
          <div className="flex gap-8 text-sm font-bold text-neutral-600">
            <Link href="/explore" className="hover:text-black transition-colors">Law Vault</Link>
            <Link href="/login" className="hover:text-black transition-colors">Client Login</Link>
            <Link href="/signup" className="hover:text-black transition-colors">Create Account</Link>
          </div>
        </div>
      </footer>

    </div>
  );
} 