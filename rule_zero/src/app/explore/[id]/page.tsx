'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase"; 
import { generateAuditReport } from "@/lib/generateAuditPDF";

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
        } catch (error) { console.error(error); }
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
    if (!user) { alert("Please log in to save progress!"); return; }
    const newChecked = new Set(checkedItems);
    const isAdding = !newChecked.has(clauseId);
    isAdding ? newChecked.add(clauseId) : newChecked.delete(clauseId);
    setCheckedItems(newChecked);
    await fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.uid, clauseId, actionType: 'AUDITED', isAdding }) });
  };

  const handleDecodeRule = async (clauseId: string) => {
    if (!user) { alert("Please log in to track knowledge score!"); return; }
    setDecodedClauses(prev => new Set(prev).add(clauseId));
    await fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.uid, clauseId, actionType: 'DECODED', isAdding: true }) });
  };

  if (loading) return <div className="min-h-screen bg-[#f4f4f0] flex items-center justify-center font-sans text-neutral-400 font-bold uppercase tracking-widest">Loading...</div>;
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
    <div className="min-h-screen bg-[#f4f4f0] font-sans text-slate-900 pb-20 selection:bg-[#ffc900]">
      <main className="max-w-5xl mx-auto px-6 pt-10">
        
        <div className="mb-6">
          <Link href="/explore" className="inline-block text-xs font-bold text-neutral-500 hover:text-black uppercase tracking-widest transition-colors">
            ← Back to Catalog
          </Link>
        </div>

        <div className="bg-white border border-neutral-200 p-8 md:p-10 rounded-3xl shadow-sm mb-10 relative overflow-hidden">
          {/* Subtle Top Accent */}
          <div className={`absolute top-0 left-0 w-full h-2 ${persona === 'citizen' ? 'bg-[#ffc900]' : 'bg-black'}`}></div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
            <div className="flex bg-neutral-100 rounded-lg p-1">
              <button onClick={() => setPersona('citizen')} className={`px-4 py-2 text-xs font-bold uppercase rounded-md transition-all ${persona === 'citizen' ? 'bg-white shadow-sm text-black' : 'text-neutral-500 hover:text-black'}`}>Citizen Mode</button>
              <button onClick={() => setPersona('business')} className={`px-4 py-2 text-xs font-bold uppercase rounded-md transition-all ${persona === 'business' ? 'bg-white shadow-sm text-black' : 'text-neutral-500 hover:text-black'}`}>Business Mode</button>
            </div>

            {persona === 'citizen' ? (
              <div className="text-right">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Civic Knowledge</span>
                <span className="text-2xl font-black text-black">{decodedClauses.size} <span className="text-xs text-neutral-400">Decoded</span></span>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Compliance Score</span>
                  <span className="text-2xl font-black text-black">{auditProgress}%</span>
                </div>
                <button onClick={() => generateAuditReport(user, documentData.title, industry, filteredClauses, checkedItems)} className="text-[10px] bg-black text-white px-3 py-1.5 rounded-md font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors">
                  Export PDF
                </button>
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-8 text-black">
            {documentData.title}
          </h1>
          
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Search sections or keywords..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-neutral-50 border border-neutral-200 text-black px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc900] focus:border-transparent transition-all text-sm"
            />
            {persona === 'business' && (
              <select value={industry} onChange={(e) => setIndustry(e.target.value as any)} className="bg-neutral-50 border border-neutral-200 text-black px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm font-bold">
                <option value="general">All Startups</option>
                <option value="ecommerce">E-Commerce Brand</option>
                <option value="gamedev">Game Dev Studio</option>
              </select>
            )}
          </div>
        </div>

        {persona === 'citizen' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredClauses.map((clause) => {
              const isDecoded = decodedClauses.has(clause.id);
              return (
                <div key={clause.id} onClick={() => handleOpenClause(clause)} className={`bg-white border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${isDecoded ? 'border-[#ffc900]' : 'border-neutral-200'}`}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-black text-black">Sec {clause.clause_number}</h3>
                      {isDecoded && <span className="text-[#ffc900] font-bold text-xl">✓</span>}
                    </div>
                    {clause.title && <h4 className="text-sm font-bold text-neutral-800 mb-2 leading-snug">{clause.title}</h4>}
                    <p className="text-neutral-500 text-sm line-clamp-3 leading-relaxed">{clause.content_text}</p>
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
                  <div key={clause.id} className={`flex flex-col md:flex-row gap-4 p-5 rounded-2xl border transition-all ${isChecked ? 'bg-neutral-50 border-neutral-200 opacity-60' : 'bg-white border-neutral-200 shadow-sm hover:shadow-md'}`}>
                    <div className="shrink-0 pt-1">
                      <button onClick={(e) => { e.stopPropagation(); toggleCheck(clause.id); }} className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-black border-black text-white' : 'bg-white border-neutral-300 text-transparent hover:border-black'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-black bg-neutral-100 text-neutral-600 px-2 py-1 rounded">SEC {clause.clause_number}</span>
                        {clause.title && <h3 className="text-base font-bold text-black">{clause.title}</h3>}
                      </div>
                      <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-sm text-neutral-700 leading-relaxed mb-3">
                        {clause.ai_description || "Manual review required."}
                      </div>
                      <button onClick={() => setSelectedClause(clause)} className="text-xs font-bold text-neutral-400 hover:text-black uppercase tracking-wider transition-colors">Read Full Text →</button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 border border-neutral-200 border-dashed rounded-2xl bg-white"><p className="font-bold text-neutral-400">No compliance items match your search.</p></div>
            )}
          </div>
        )}
      </main>

      {selectedClause && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedClause(null)}></div>
          <div className="relative bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest block mb-1">Section {selectedClause.clause_number}</span>
                <h2 className="text-2xl font-black text-black leading-tight">{selectedClause.title || "Section Details"}</h2>
              </div>
              <button onClick={() => setSelectedClause(null)} className="text-neutral-400 hover:text-black transition-colors bg-neutral-100 hover:bg-neutral-200 p-2 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-8">
              {selectedClause.ai_description && (
                <div className="bg-[#ffc900]/10 border border-[#ffc900]/30 p-6 rounded-2xl">
                  <span className="text-[10px] font-black uppercase tracking-widest text-yellow-800 block mb-2">Simplified Explanation</span>
                  <p className="text-black font-medium leading-relaxed">{selectedClause.ai_description}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3">Official Legislative Text</h4>
                <div className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">{selectedClause.content_text}</div>
              </div>

              {persona === 'citizen' && (
                <div className="pt-6 border-t border-neutral-100">
                  {!decodedClauses.has(selectedClause.id) ? (
                    <button onClick={() => handleDecodeRule(selectedClause.id)} className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-neutral-800 transition-colors">
                      Mark as Decoded
                    </button>
                  ) : (
                    <div className="w-full py-4 bg-neutral-100 text-neutral-500 font-bold rounded-xl text-center flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      Decoded & Logged
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}