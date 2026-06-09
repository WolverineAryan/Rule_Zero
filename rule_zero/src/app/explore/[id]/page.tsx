'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase"; 
import { generateAuditReport } from "@/lib/generateAuditPDF";
import { motion, AnimatePresence } from "framer-motion";

type Clause = { id: string; clause_number: string; title: string | null; content_text: string; ai_description: string | null; requires_compliance: boolean; };
type ActDetails = { id: string; title: string; enactment_year: number; clauses: Clause[]; };

export default function IndividualLawView() {
  const { id } = useParams();
  const [documentData, setDocumentData] = useState<ActDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [persona, setPersona] = useState<'citizen' | 'business'>('citizen');
  const [decodedClauses, setDecodedClauses] = useState<Set<string>>(new Set());
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [industry, setIndustry] = useState<'general' | 'gamedev' | 'ecommerce'>('general');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) { setDecodedClauses(new Set()); setCheckedItems(new Set()); }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchUserProgress() {
      if (user) {
        try {
          const res = await fetch(`/api/progress?userId=${user.uid}`);
          if (res.ok) {
            const actions = await res.json();
            const decoded = new Set<string>();
            const audited = new Set<string>();
            actions.forEach((action: any) => {
              if (action.action_type === 'DECODED') decoded.add(action.clause_id);
              if (action.action_type === 'AUDITED') audited.add(action.clause_id);
            });
            setDecodedClauses(decoded);
            setCheckedItems(audited);
          }
        } catch (error) { console.error("Progress trace failure", error); }
      }
    }
    fetchUserProgress();
  }, [user]);

  useEffect(() => {
    async function getDocumentDetails() {
      try {
        const res = await fetch(`/api/acts/${id}`);
        if (!res.ok) { setDocumentData(null); setLoading(false); return; }
        const data = await res.json();
        setDocumentData(data);
        setLoading(false);
      } catch (error) { setLoading(false); }
    }
    if (id) getDocumentDetails();
  }, [id]);

  const toggleCheck = async (clauseId: string) => {
    if (!user) { alert("Please authenticate to write state telemetry!"); return; }
    const newChecked = new Set(checkedItems);
    const isAdding = !newChecked.has(clauseId);
    isAdding ? newChecked.add(clauseId) : newChecked.delete(clauseId);
    setCheckedItems(newChecked);
    await fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.uid, clauseId, actionType: 'AUDITED', isAdding }) });
  };

  const handleDecodeRule = async (clauseId: string) => {
    if (!user) { alert("Please authenticate to sync telemetry score!"); return; }
    setDecodedClauses(prev => new Set(prev).add(clauseId));
    await fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.uid, clauseId, actionType: 'DECODED', isAdding: true }) });
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FCFAF7] flex items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-3">
        <div className="w-5 h-5 border-2 border-[#EBE5DF] border-t-[#DE9E26] rounded-full animate-spin"></div>
        <span className="text-[10px] font-bold text-[#261F1A]/40 uppercase tracking-widest">Parsing Workspace Node...</span>
      </div>
    </div>
  );
  if (!documentData) return null;

  const filteredClauses = documentData.clauses.filter(clause => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = clause.clause_number.toLowerCase().includes(searchLower) || (clause.title && clause.title.toLowerCase().includes(searchLower)) || clause.content_text.toLowerCase().includes(searchLower);
    if (persona === 'business') {
      if (!clause.requires_compliance) return false;
      if (industry === 'ecommerce') return matchesSearch && (clause.content_text.toLowerCase().includes('secure') || clause.content_text.toLowerCase().includes('record') || clause.content_text.toLowerCase().includes('payment'));
      if (industry === 'gamedev') return matchesSearch && (clause.content_text.toLowerCase().includes('data') || clause.content_text.toLowerCase().includes('minor') || clause.content_text.toLowerCase().includes('secure'));
      return matchesSearch;
    }
    return matchesSearch;
  });

  const auditProgress = filteredClauses.length === 0 ? 0 : Math.round((checkedItems.size / filteredClauses.length) * 100);

  return (
    <div className="min-h-screen bg-[#FCFAF7] font-sans text-[#261F1A] pb-24 selection:bg-[#DE9E26]/20">
      <main className="max-w-5xl mx-auto px-6 pt-12">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link href="/explore" className="inline-flex items-center gap-2 text-[10px] font-bold text-[#261F1A]/50 hover:text-black uppercase tracking-widest transition-colors">
            <span>←</span> Return to Repository
          </Link>
        </div>

        {/* 🏢 MODERN ARCHITECTURAL COMMAND DASHBOARD */}
        <div className="bg-white border border-[#EBE5DF] rounded-2xl p-8 md:p-10 shadow-sm shadow-[#261F1A]/5 mb-10">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 pb-8 border-b border-[#EBE5DF]">
            
            <div className="flex-1">
              <div className="flex bg-[#FCFAF7] border border-[#EBE5DF] rounded-xl p-1 inline-flex mb-6">
                <button onClick={() => setPersona('citizen')} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${persona === 'citizen' ? 'bg-[#261F1A] text-white shadow-sm' : 'text-[#261F1A]/50 hover:text-black'}`}>Public Explorer</button>
                <button onClick={() => setPersona('business')} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${persona === 'business' ? 'bg-[#261F1A] text-white shadow-sm' : 'text-[#261F1A]/50 hover:text-black'}`}>Governance Audit</button>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-serif font-normal tracking-tight text-[#261F1A] mb-3 leading-tight">
                {documentData.title}
              </h1>
              <span className="inline-block px-3 py-1 bg-[#FCFAF7] border border-[#EBE5DF] text-[#261F1A]/60 text-[10px] font-bold uppercase tracking-widest rounded">
                Gazette Frame: {documentData.enactment_year}
              </span>
            </div>

            {/* Micro Score Widget */}
            <div className="shrink-0 bg-[#FCFAF7] border border-[#EBE5DF] rounded-xl p-6 min-w-[220px]">
              {persona === 'citizen' ? (
                <div>
                  <span className="text-[9px] font-bold text-[#261F1A]/50 uppercase tracking-widest block mb-1">Knowledge Metric</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black tracking-tight">{decodedClauses.size}</span>
                    <span className="text-[9px] font-bold text-[#DE9E26] uppercase tracking-wider">Decoded</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[9px] font-bold text-[#261F1A]/50 uppercase tracking-widest">Pipeline Integrity</span>
                    <span className="text-xl font-black text-[#261F1A]">{auditProgress}%</span>
                  </div>
                  <div className="w-full bg-[#EBE5DF] h-1 rounded-full mb-4">
                    <div className="bg-[#DE9E26] h-1 rounded-full transition-all duration-500" style={{ width: `${auditProgress}%` }}></div>
                  </div>
                  <button onClick={() => generateAuditReport(user, documentData.title, industry, filteredClauses, checkedItems)} className="w-full text-center bg-[#261F1A] text-white py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-sm">
                    Export Audit Report
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Precision Search & Scope Filter bar */}
          <div className="flex flex-col md:flex-row gap-4 pt-6">
            <div className="flex-1">
              <input 
                type="text" 
                placeholder="Query clause strings, legal terms, or indices..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FCFAF7] border border-[#EBE5DF] text-[#261F1A] placeholder-[#261F1A]/30 px-4 py-3 rounded-xl focus:outline-none focus:border-[#DE9E26] transition-all text-xs font-semibold"
              />
            </div>
            {persona === 'business' && (
              <select value={industry} onChange={(e) => setIndustry(e.target.value as any)} className="bg-[#FCFAF7] border border-[#EBE5DF] text-[#261F1A] px-4 py-3 rounded-xl focus:outline-none focus:border-[#DE9E26] text-xs font-bold appearance-none cursor-pointer">
                <option value="general">Global Operational Map</option>
                <option value="ecommerce">E-Commerce Architecture Scope</option>
                <option value="gamedev">Interactive Virtual Economy Scope</option>
              </select>
            )}
          </div>
        </div>

        {/* 🏢 CLAUSE INDEX RENDER LAYERS */}
        {persona === 'citizen' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredClauses.map((clause) => {
              const isDecoded = decodedClauses.has(clause.id);
              return (
                <div key={clause.id} onClick={() => setSelectedClause(clause)} className={`bg-white border p-6 rounded-xl cursor-pointer flex flex-col justify-between group transition-all duration-200 ${isDecoded ? 'border-[#DE9E26] shadow-sm' : 'border-[#EBE5DF] hover:border-[#261F1A]/30'}`}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-[#FCFAF7] border border-[#EBE5DF] px-2 py-0.5 rounded text-[#261F1A]/70">Section {clause.clause_number}</span>
                      {isDecoded && <span className="text-[#DE9E26] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">✓ Decoded</span>}
                    </div>
                    {clause.title && <h4 className="text-base font-bold text-[#261F1A] mb-2 leading-snug">{clause.title}</h4>}
                    <p className="text-[#261F1A]/60 text-xs line-clamp-3 leading-relaxed font-medium">{clause.content_text}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#FCFAF7] text-[9px] font-bold text-[#261F1A]/30 uppercase tracking-widest group-hover:text-[#261F1A] transition-colors">
                    Initialize Context View →
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClauses.length > 0 ? (
              filteredClauses.map((clause) => {
                const isChecked = checkedItems.has(clause.id);
                return (
                  <div key={clause.id} className={`flex flex-col sm:flex-row gap-6 p-6 bg-white border rounded-xl transition-all ${isChecked ? 'border-[#EBE5DF] opacity-50' : 'border-[#EBE5DF] hover:border-[#DE9E26]'}`}>
                    
                    {/* Minimalist Checkbox Node */}
                    <div className="shrink-0">
                      <button onClick={() => toggleCheck(clause.id)} className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-[#261F1A] border-[#261F1A] text-white' : 'bg-white border-[#EBE5DF] text-transparent hover:border-[#261F1A]'}`}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      </button>
                    </div>

                    {/* Operational Details Column */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#261F1A]/50">Clause Index {clause.clause_number}</span>
                        {clause.title && <h3 className="text-sm font-bold text-[#261F1A]">{clause.title}</h3>}
                      </div>
                      
                      <div className="bg-[#FCFAF7] border border-[#EBE5DF] p-4 rounded-xl text-xs text-[#261F1A]/80 font-medium leading-relaxed mb-4">
                        {clause.ai_description || "Awaiting structural AI description map."}
                      </div>
                      
                      <button onClick={() => setSelectedClause(clause)} className="text-[9px] font-bold text-[#261F1A]/40 hover:text-black uppercase tracking-widest transition-colors inline-flex items-center gap-1">
                        Review Raw Legislative String ↗
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-white border border-dashed border-[#EBE5DF] rounded-xl"><p className="text-xs font-bold text-[#261F1A]/40 uppercase tracking-widest">No matching clauses caught in this playbook parameter.</p></div>
            )}
          </div>
        )}
      </main>

      {/* 🚀 MODAL CLR COMPACT TRANSITION LAYERS */}
      <AnimatePresence>
        {selectedClause && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#261F1A]/40 backdrop-blur-sm" onClick={() => setSelectedClause(null)} />
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} className="relative bg-white border border-[#EBE5DF] rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden z-10">
              
              <div className="px-8 py-5 border-b border-[#EBE5DF] bg-[#FCFAF7] flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold text-[#261F1A]/40 uppercase tracking-widest block mb-1">Detailed View // Sec {selectedClause.clause_number}</span>
                  <h2 className="text-xl font-serif font-normal text-[#261F1A] pr-6">{selectedClause.title || "Legislative Extract"}</h2>
                </div>
                <button onClick={() => setSelectedClause(null)} className="text-[#261F1A]/40 hover:text-black transition-colors bg-white border border-[#EBE5DF] p-1.5 rounded-lg shadow-sm">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto flex-1 space-y-6">
                {selectedClause.ai_description && (
                  <div className="bg-[#FCFAF7] border-l-2 border-[#DE9E26] p-5 rounded-r-xl">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#DE9E26] block mb-2">Simulated Executive Summary</span>
                    <p className="text-[#261F1A] font-medium leading-relaxed text-xs">{selectedClause.ai_description}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-[9px] font-bold uppercase tracking-widest text-[#261F1A]/40 mb-3 pb-1 border-b border-[#FCFAF7]">Raw Legislative Text</h4>
                  <div className="text-[#261F1A]/70 text-xs font-serif leading-relaxed whitespace-pre-wrap">{selectedClause.content_text}</div>
                </div>

                {persona === 'citizen' && (
                  <div className="pt-4">
                    {!decodedClauses.has(selectedClause.id) ? (
                      <button onClick={() => { handleDecodeRule(selectedClause.id); setSelectedClause(null); }} className="w-full py-3 bg-[#261F1A] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-black transition-colors shadow-md">
                        Mark Clause as Decoded
                      </button>
                    ) : (
                      <div className="w-full py-3 bg-[#FCFAF7] border border-[#EBE5DF] text-[#261F1A]/40 text-xs font-bold uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2">
                        ✓ Registered in Structural Memory
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}