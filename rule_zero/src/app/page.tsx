'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { motion } from 'framer-motion';

function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const resizeCanvas = () => {
      const width = canvas.parentElement?.offsetWidth || window.innerWidth;
      const height = canvas.parentElement?.offsetHeight || window.innerHeight;
      
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      
      ctx.clearRect(0, 0, width, height);
      
      const centerY = height * 0.7;
      phase += 0.005;

      const configurations = [
        { amplitude: 35, frequency: 0.004, color: 'rgba(222, 158, 38, 0.06)', speed: 1 },
        { amplitude: 20, frequency: 0.006, color: 'rgba(38, 31, 26, 0.03)', speed: -1.2 },
        { amplitude: 15, frequency: 0.009, color: 'rgba(222, 158, 38, 0.09)', speed: 0.8 }
      ];

      configurations.forEach((config) => {
        ctx.beginPath();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = 1.5;

        for (let x = 0; x < width; x++) {
          const y = centerY + 
            Math.sin(x * config.frequency + phase * config.speed) * config.amplitude +
            Math.cos(x * (config.frequency * 0.4) + phase) * (config.amplitude * 0.4);
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 block pointer-events-none z-0 opacity-100"
    />
  );
}

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (!mounted) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <div className="min-h-screen bg-[#FCFAF7] font-sans text-[#261F1A] selection:bg-[#DE9E26]/20 selection:text-[#261F1A] overflow-x-hidden">
      
      {/* 🚀 NAVBAR */}
      <nav className="fixed top-0 w-full bg-[#FCFAF7]/90 backdrop-blur-md border-b border-[#EBE5DF] z-50">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-[#261F1A] flex items-center gap-2.5">
            <div className="w-5 h-5 bg-[#DE9E26] rounded-sm transform rotate-45"></div>
            <span>Rule_Zero</span>
          </Link>
          <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-[#261F1A]/70">
            <Link href="/explore" className="hover:text-black transition-colors">Law Vault</Link>
            {user ? (
              <Link href="/explore" className="px-5 py-2.5 bg-[#261F1A] text-white rounded-lg hover:bg-black transition-all shadow-sm">Dashboard</Link>
            ) : (
              <Link href="/login" className="px-5 py-2.5 bg-[#DE9E26] text-[#261F1A] rounded-lg hover:bg-[#C98D1E] hover:text-white transition-all shadow-sm">Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      {/* 🚀 SECTION 1: HERO */}
      <section className="relative pt-44 pb-32 px-6 flex flex-col items-center justify-center text-center min-h-[90vh] bg-[#FCFAF7]">
        <WaveBackground />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto flex flex-col items-center"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5EFE9] border border-[#EBE5DF] text-[#261F1A] text-[10px] font-bold uppercase tracking-widest mb-8 shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#DE9E26]"></span>
            The Indian Legislative Operating System
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-serif font-normal tracking-tight text-[#261F1A] mb-8 leading-[1.15]"
          >
            Legislation Decoded. <br />
            <span className="font-sans font-black text-transparent bg-clip-text bg-gradient-to-r from-[#261F1A] to-[#DE9E26]">
              Compliance Computed.
            </span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="max-w-2xl mx-auto text-base md:text-lg text-[#261F1A]/70 mb-12 leading-relaxed font-medium"
          >
            Rule_Zero abstracts the noise out of the Gazette of India. Translate complex constitutional texts into plain, structured operational paths for scaling startups and active citizens.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto"
          >
            {user ? (
              <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }} className="w-full sm:w-auto">
                <Link href="/explore" className="inline-block w-full text-center px-8 py-4 bg-[#261F1A] text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-md hover:bg-black transition-all">
                  Open Terminal
                </Link>
              </motion.div>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }} className="w-full sm:w-auto">
                  <Link href="/signup" className="inline-block w-full text-center px-8 py-4 bg-[#DE9E26] text-[#261F1A] font-bold text-sm uppercase tracking-wider rounded-xl shadow-md hover:bg-[#C98D1E] hover:text-white transition-all">
                    Start Free Audit
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }} className="w-full sm:w-auto">
                  <Link href="/explore" className="inline-block w-full text-center px-8 py-4 bg-white text-[#261F1A] font-bold text-sm uppercase tracking-wider rounded-xl border border-[#EBE5DF] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2">
                    Browse Law Vault <span>→</span>
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* 🚀 SECTION 2: METRICS */}
      <section className="py-24 px-6 bg-white border-y border-[#EBE5DF]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <h2 className="text-3xl md:text-4xl font-serif font-normal tracking-tight text-[#261F1A] mb-6 leading-tight">
                The scope of tech liability in India has shifted permanently.
              </h2>
              <p className="text-[#261F1A]/70 mb-6 leading-relaxed text-sm font-medium">
                With the activation of the Digital Personal Data Protection (DPDP) Act and modernized consumer data frameworks, tech businesses, gaming studios, and infrastructure services must build audit trails early.
              </p>
              <p className="text-[#261F1A]/70 leading-relaxed text-sm font-medium">
                Rule_Zero strips away thousands of pages of cross-references, mapping exactly what your architectural framework requires to operate safely under the Ministry of Law and Justice.
              </p>
            </div>
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="bg-[#FCFAF7] border border-[#EBE5DF] p-6 rounded-2xl">
                <h4 className="text-3xl font-black text-[#261F1A] mb-1">₹250Cr</h4>
                <p className="text-[10px] font-bold text-[#DE9E26] uppercase tracking-widest">Max DPDP Penalty</p>
              </div>
              <div className="bg-[#FCFAF7] border border-[#EBE5DF] p-6 rounded-2xl">
                <h4 className="text-3xl font-black text-[#261F1A] mb-1">500+</h4>
                <p className="text-[10px] font-bold text-[#DE9E26] uppercase tracking-widest">Pages Indexed</p>
              </div>
              <div className="bg-[#FCFAF7] border border-[#EBE5DF] p-6 rounded-2xl">
                <h4 className="text-3xl font-black text-[#261F1A] mb-1">100%</h4>
                <p className="text-[10px] font-bold text-[#DE9E26] uppercase tracking-widest">Audit Output</p>
              </div>
              <div className="bg-[#261F1A] p-6 rounded-2xl text-white">
                <h4 className="text-3xl font-black text-[#DE9E26] mb-1">0</h4>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Unparsed Jargon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 SECTION 3: INDUSTRY CHANNELS */}
      <section className="py-24 px-6 bg-[#FCFAF7]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-normal tracking-tight text-[#261F1A] mb-3">Targeted Industry Frameworks</h2>
            <p className="text-[#261F1A]/60 max-w-xl mx-auto text-sm font-medium">Isolate structural liabilities instantly by switching your operation context.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "💼", title: "E-Commerce Systems", desc: "Align platforms directly with Consumer Protection Rules 2020. Protect checkout workflows, display transparency factors, and automate hardware return legal compliance maps." },
              { icon: "🛠", title: "Application Infrastructure", desc: "Whether compiling native backends or building frontends, isolate explicit pipeline items required to handle citizen identity securely under current data protocols." },
              { icon: "🔮", title: "Interactive Software", desc: "Isolate precise guidelines for virtual micro-economies, platform gating controls, and transaction trails dictated by the Ministry of Electronics and IT." }
            ].map((item, idx) => (
              <motion.div whileHover={{ y: -4 }} key={idx} className="bg-white border border-[#EBE5DF] p-8 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-[#FCFAF7] rounded-xl border border-[#EBE5DF] flex items-center justify-center mb-6 text-lg">{item.icon}</div>
                <h3 className="text-lg font-bold text-[#261F1A] mb-3">{item.title}</h3>
                <p className="text-[#261F1A]/70 text-xs font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 SECTION 4: INDEXED REPOSITORY */}
      <section className="py-24 px-6 bg-[#261F1A] text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-normal tracking-tight mb-3">The Indexed Repository</h2>
            <p className="text-[#DE9E26] text-xs font-bold uppercase tracking-widest">Parser pipelines continuously updated for the latest Gazette updates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { act: "Act No. 22 of 2023", title: "Digital Personal Data Protection Act", desc: "Mandatory structural paths for modern databases inside Indian borders. Simplifies notice rules, consent structures, and data erasure mechanics." },
              { act: "Act No. 21 of 2000", title: "The Information Technology Act", desc: "The root framework governing digital encryption, legal electronic agreements, identity data management, and operational security liabilities." },
              { act: "G.S.R. 462(E)", title: "Consumer Protection Rules", desc: "Crucial structures for online merchant networks, processing distinct mandates for product tracking, localized updates, and user returns." },
              { act: "G.S.R. 801(E)", title: "E-Waste Management Framework", desc: "Essential for hardware channels. Explicit paths handling structural producer response factors and environmental tracking components." }
            ].map((law, idx) => (
              <div key={idx} className="bg-[#1E1814] border border-neutral-800 p-8 rounded-2xl hover:border-[#DE9E26]/40 transition-colors">
                <span className="bg-[#DE9E26]/10 text-[#DE9E26] text-[10px] font-bold px-2.5 py-1 rounded border border-[#DE9E26]/20 uppercase tracking-widest">{law.act}</span>
                <h3 className="text-lg font-bold mt-5 mb-3 text-white">{law.title}</h3>
                <p className="text-neutral-400 text-xs font-medium leading-relaxed">{law.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 SECTION 5: PIPELINE */}
      <section className="py-24 px-6 bg-white border-b border-[#EBE5DF]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-normal tracking-tight text-[#261F1A] mb-3">The Parsing Workflow</h2>
            <p className="text-[#261F1A]/50 text-sm font-medium">A deliberate, repeatable methodology for compliance engineering.</p>
          </div>

          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-[#EBE5DF]">
            {[
              { num: "01", title: "Isolate System Target", desc: "Declare your operating scope. We instantly mask secondary frameworks, creating a tailored collection of acts relevant exclusively to your logic layout." },
              { num: "02", title: "Execute Translation Protocol", desc: "Pass complex clauses through our contextual simplification layer. Dense archaic legalese is stripped down to clear, executable operational steps." },
              { num: "03", title: "Maintain Cloud Audit Trail", desc: "Track progress seamlessly across iterative changes. State adjustments write cleanly to an encrypted Postgres vault, compiling clear validation matrices." }
            ].map((item, idx) => (
              <div key={idx} className="relative flex items-start gap-6 group">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FCFAF7] border border-[#EBE5DF] text-[#DE9E26] text-xs font-bold shrink-0 z-10 shadow-sm">
                  {item.num}
                </div>
                <div className="bg-[#FCFAF7] border border-[#EBE5DF] p-6 rounded-2xl flex-1">
                  <h3 className="text-base font-bold text-[#261F1A] mb-2">{item.title}</h3>
                  <p className="text-[#261F1A]/70 text-xs font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 SECTION 6: FAQ */}
      <section className="py-24 px-6 bg-[#FCFAF7] border-b border-[#EBE5DF]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-normal tracking-tight text-[#261F1A]">Platform Disclaimers & Scope</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "Does Rule_Zero replace an retained legal advocate?", a: "No. Rule_Zero operates as an engineering-focused pre-audit protocol. It structuralizes code paths so you know what requirements exist, but doesn't replace tailored, registered legal opinion." },
              { q: "How is data processing handled safely?", a: "Audit progress targets are strictly compartmentalized by cryptographic user identities. Rule_Zero stores structural completion flags inside verified cloud infrastructure pipelines." }
            ].map((faq, idx) => (
              <div key={idx} className="p-6 bg-white border border-[#EBE5DF] rounded-xl shadow-sm">
                <h4 className="text-sm font-bold text-[#261F1A] mb-2">{faq.q}</h4>
                <p className="text-[#261F1A]/60 text-xs font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 SECTION 7: DUAL LENS ARCHITECTURE */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-normal tracking-tight text-[#261F1A] mb-3">Two Modes of Operation</h2>
          <p className="text-[#261F1A]/50 text-sm font-medium">Select the system alignment that fits your task layer.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-[#EBE5DF] p-10 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded bg-[#FCFAF7] border border-[#EBE5DF] text-[#261F1A]/60 text-[10px] font-bold uppercase tracking-widest mb-6">Mode 01 // Public Sector</span>
              <h3 className="text-2xl font-bold text-[#261F1A] mb-3">Civic Encyclopedia</h3>
              <p className="text-[#261F1A]/60 text-xs font-medium leading-relaxed mb-8">
                Isolate raw constitutional elements cleanly. Browse unparsed rules mapped out explicitly in real-world everyday syntax to audit consumer, digital, and data rights instantly.
              </p>
            </div>
            <Link href="/explore" className="w-full text-center px-6 py-3.5 bg-[#FCFAF7] text-[#261F1A] border border-[#EBE5DF] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#F5EFE9] transition-colors">
              Access Civic Vault
            </Link>
          </div>

          <div className="bg-[#261F1A] text-white p-10 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div>
              <span className="inline-block px-3 py-1 rounded bg-neutral-900 border border-neutral-800 text-[#DE9E26] text-[10px] font-bold uppercase tracking-widest mb-6">Mode 02 // Governance Node</span>
              <h3 className="text-2xl font-bold text-white mb-3">Startup Audit Terminal</h3>
              <p className="text-neutral-400 text-xs font-medium leading-relaxed mb-8">
                Designed explicitly for structural validation maps. Lock down data constraints for deployment, track persistent compliance metrics, and deliver verified output frameworks for enterprise stakeholders.
              </p>
            </div>
            <Link href={user ? "/explore" : "/login"} className="w-full text-center px-6 py-3.5 bg-[#DE9E26] text-[#261F1A] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#C98D1E] hover:text-white transition-all shadow-md">
              Initialize Audit Engine
            </Link>
          </div>
        </div>
      </section>

      {/* 🚀 FOOTER */}
      <footer className="bg-white border-t border-[#EBE5DF] py-14 px-6 mt-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-lg font-bold tracking-tight text-[#261F1A] flex items-center gap-2 justify-center md:justify-start">
              <div className="w-4 h-4 bg-[#DE9E26] rounded-sm transform rotate-45"></div>
              <span>Rule_Zero</span>
            </h2>
            <p className="text-[#261F1A]/50 text-xs mt-2 font-semibold uppercase tracking-wider">The Indian Legislative Operating System.</p>
          </div>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-[#261F1A]/60">
            <Link href="/explore" className="hover:text-black transition-colors">Law Vault</Link>
            <Link href="/login" className="hover:text-black transition-colors">Console Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}