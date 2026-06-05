'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-[#f4f4f0] font-sans text-black selection:bg-yellow-300">
      
      {/* SECTION 1: THE MONOLITHIC ENTRANCE */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-6 relative border-b-8 border-black overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', backgroundSize: '64px 64px' }}>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-[15vw] md:text-[10rem] lg:text-[12rem] font-black uppercase tracking-tighter leading-none mb-4 text-white drop-shadow-[12px_12px_0px_rgba(0,0,0,1)]" 
              style={{ WebkitTextStroke: '6px black' }}>
            RULE_ZERO<span className="text-[#ffc900] inline-block -translate-y-4 md:-translate-y-8">.</span>
          </h1>
          
          <p className="text-xl md:text-3xl lg:text-4xl font-black uppercase tracking-widest bg-black text-white px-8 py-4 inline-block transform -rotate-2 shadow-[8px_8px_0px_0px_rgba(255,201,0,1)]">
            The Operating System for Law
          </p>
        </div>

        <div className="absolute bottom-12 animate-bounce bg-white border-4 border-black rounded-full p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </section>

      {/* SECTION 2: THE CORE MISSION */}
      <section className="py-32 px-6 max-w-6xl mx-auto text-center border-b-4 border-black border-dashed relative">
        <div className="inline-block px-5 py-2 bg-white border-4 border-black rounded-full font-black text-sm uppercase tracking-widest mb-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          ⚡ Re-Engineering Legal Architecture
        </div>
        
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-10">
          LEGISLATION<br />
          <span className="bg-[#ffc900] px-6 border-4 border-black inline-block transform -rotate-2 my-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">DECODED.</span><br />
          COMPLIANCE COMPUTED.
        </h2>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl font-bold text-neutral-600 mb-12 leading-relaxed uppercase">
          Rule_Zero isolates the noise. Track your civic awareness as an everyday citizen, or run high-speed compliance playbooks for your tech startup or gaming studio.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          {user ? (
            <Link href="/explore" className="px-8 py-5 bg-emerald-400 text-black font-black text-xl rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase">
              Go To Dashboard
            </Link>
          ) : (
            <>
              <Link href="/signup" className="px-8 py-5 bg-black text-white font-black text-xl rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,201,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase">
                Claim Free Account
              </Link>
              <Link href="/explore" className="px-8 py-5 bg-white text-black font-black text-xl rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase flex items-center justify-center gap-2">
                Enter Law Vault <span className="text-2xl leading-none">→</span>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* SECTION 3: SYSTEM CAPABILITIES */}
      <section className="py-32 px-6 bg-white border-b-8 border-black">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-20 text-center">System Capabilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#f4f4f0] border-4 border-black p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-emerald-400 border-4 border-black rounded-full flex items-center justify-center text-3xl mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black">1</div>
              <h4 className="text-3xl font-black uppercase mb-4 leading-tight">AI Translation Engine</h4>
              <p className="font-bold text-neutral-600 uppercase text-sm leading-relaxed">Raw legal text is processed through local AI pipelines, stripping away confusing legalese to give you clear, actionable guidelines.</p>
            </div>
            <div className="bg-[#f4f4f0] border-4 border-black p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-blue-400 text-white border-4 border-black rounded-full flex items-center justify-center text-3xl mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black">2</div>
              <h4 className="text-3xl font-black uppercase mb-4 leading-tight">Industry Playbooks</h4>
              <p className="font-bold text-neutral-600 uppercase text-sm leading-relaxed">Don't read laws that don't apply to you. Select your exact startup sector (like E-Commerce or Gaming) and filter out the noise instantly.</p>
            </div>
            <div className="bg-[#f4f4f0] border-4 border-black p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-[#ffc900] border-4 border-black rounded-full flex items-center justify-center text-3xl mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black">3</div>
              <h4 className="text-3xl font-black uppercase mb-4 leading-tight">PDF Audit Export</h4>
              <p className="font-bold text-neutral-600 uppercase text-sm leading-relaxed">Track your progress directly in the cloud. Hit 100% compliance and export a structured, color-coded PDF report to show your investors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: DUAL MODE SPLIT CARDS */}
      <section className="py-32 px-6 max-w-6xl mx-auto pb-40">
        <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-20 text-center">Choose Your Lens</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <div className="bg-[#ffc900] border-4 border-black p-8 md:p-12 rounded-2xl shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <span className="font-black uppercase tracking-widest text-xs bg-white text-black border-2 border-black px-4 py-2 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Level 01 Citizen</span>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mt-8 mb-6">Civic Encyclopedia</h2>
              <p className="font-bold text-neutral-900 leading-relaxed mb-10 uppercase text-sm">
                Stop guessing your rights. Browse raw legal clauses instantly rewritten into plain english summaries. Earn points and decode regulations systematically.
              </p>
            </div>
            <Link href="/explore" className="w-full text-center px-6 py-5 bg-white text-black border-4 border-black font-black uppercase text-xl rounded-xl hover:bg-neutral-100 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
              Access Dashboard
            </Link>
          </div>

          <div className="bg-blue-400 text-white border-4 border-black p-8 md:p-12 rounded-2xl shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <span className="font-black uppercase tracking-widest text-xs bg-white text-black border-2 border-black px-4 py-2 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Audit Terminal</span>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mt-8 mb-6">Startup Playbooks</h2>
              <p className="font-bold text-blue-950 leading-relaxed mb-10 uppercase text-sm">
                Filter the noise. Choose your exact business architecture to lock down explicit legal liability loops and track your real-time live compliance score.
              </p>
            </div>
            <Link href={user ? "/explore" : "/login"} className="w-full text-center px-6 py-5 bg-emerald-400 text-black border-4 border-black font-black uppercase text-xl rounded-xl hover:bg-emerald-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
              Launch Audit Engine
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}