'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../../lib/firebase"; 
import { generateAuditReport } from "@/lib/generateAuditPDF";

type Clause = {
  id: string;
  clause_number: string;
  title: string | null;
  content_text: string;
  ai_description: string | null;
  requires_compliance: boolean;
};

type ActDetails = {
  id: string;
  title: string;
  enactment_year: number;
  clauses: Clause[];
};

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

  // Listen for Firebase Login State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setDecodedClauses(new Set());
        setCheckedItems(new Set());
      }
    });
    return () => unsubscribe();
  }, []);

  // 🚀 NEW: Fetch User Progress from Postgres when they log in
  useEffect(() => {
    async function fetchUserProgress() {
      if (user) {
        try {
          const res = await fetch(`/api/progress?userId=${user.uid}`);
          if (res.ok) {
            const actions = await res.json();
            const decoded = new Set<string>();
            const audited = new Set<string>();
            
            // Rebuild the sets from database records
            actions.forEach((action: any) => {
              if (action.action_type === 'DECODED') decoded.add(action.clause_id);
              if (action.action_type === 'AUDITED') audited.add(action.clause_id);
            });
            
            setDecodedClauses(decoded);
            setCheckedItems(audited);
          }
        } catch (error) {
          console.error("Failed to load user progress:", error);
        }
      }
    }
    fetchUserProgress();
  }, [user]);

  // Fetch Core Document Data
  useEffect(() => {
    async function getDocumentDetails() {
      try {
        const res = await fetch(`/api/acts/${id}`);
        if (!res.ok) {
          setDocumentData(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setDocumentData(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }
    if (id) getDocumentDetails();
  }, [id]);

  const handleOpenClause = (clause: Clause) => {
    setSelectedClause(clause);
  };

  // 🚀 UPDATED: Save Audit Check to Database
  const toggleCheck = async (clauseId: string) => {
    if (!user) {
      alert("Please log in via the top navigation bar to save your compliance audit progress!");
      return;
    }
    
    const newChecked = new Set(checkedItems);
    const isAdding = !newChecked.has(clauseId);
    
    if (isAdding) {
      newChecked.add(clauseId);
    } else {
      newChecked.delete(clauseId);
    }
    
    // Optimistic UI update (update screen instantly)
    setCheckedItems(newChecked);

    // Save strictly to Postgres Database behind the scenes
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.uid,
        clauseId: clauseId,
        actionType: 'AUDITED',
        isAdding: isAdding
      })
    });
  };

  // 🚀 UPDATED: Save Decoded Rule to Database
  const handleDecodeRule = async (clauseId: string) => {
    if (!user) {
      alert("Please log in via the top navigation bar to track your civic knowledge score!");
      return;
    }
    
    // Optimistic UI update
    setDecodedClauses(prev => new Set(prev).add(clauseId));

    // Save strictly to Postgres Database behind the scenes
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.uid,
        clauseId: clauseId,
        actionType: 'DECODED',
        isAdding: true
      })
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f0] flex items-center justify-center font-sans">
        <h2 className="text-3xl font-black uppercase animate-pulse text-black">Decompressing Layout...</h2>
      </div>
    );
  }

  if (!documentData) return null;

  const filteredClauses = documentData.clauses.filter(clause => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      clause.clause_number.toLowerCase().includes(searchLower) ||
      (clause.title && clause.title.toLowerCase().includes(searchLower)) ||
      clause.content_text.toLowerCase().includes(searchLower);
      
    if (persona === 'business') {
      if (!clause.requires_compliance) return false;
      if (industry === 'ecommerce') {
        return matchesSearch && (clause.content_text.toLowerCase().includes('secure') || clause.content_text.toLowerCase().includes('record') || clause.content_text.toLowerCase().includes('payment'));
      }
      if (industry === 'gamedev') {
        return matchesSearch && (clause.content_text.toLowerCase().includes('data') || clause.content_text.toLowerCase().includes('minor') || clause.content_text.toLowerCase().includes('secure'));
      }
      return matchesSearch;
    }
    return matchesSearch;
  });

  const auditProgress = filteredClauses.length === 0 ? 0 : Math.round((checkedItems.size / filteredClauses.length) * 100);

  return (
    <div className="min-h-screen bg-[#f4f4f0] font-sans text-black pb-20 selection:bg-yellow-300 transition-colors duration-500">
      
      <main className="max-w-6xl mx-auto px-6 pt-10">
        
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/explore" className="inline-block font-black text-sm md:text-base border-4 border-black px-4 py-2 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all uppercase">
            ← Back to Catalog
          </Link>
        </div>

        {/* Hero Section */}
        <div className={`border-4 border-black p-8 rounded-2xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-8 transition-colors duration-500 ${persona === 'citizen' ? 'bg-[#ffc900]' : 'bg-blue-400 text-white'}`}>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            
            <div className="flex bg-white border-2 border-black rounded-xl overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black uppercase text-xs text-black">
              <button onClick={() => setPersona('citizen')} className={`px-4 py-2 transition-colors ${persona === 'citizen' ? 'bg-[#ffc900]' : 'bg-neutral-200 text-neutral-500 hover:bg-neutral-100'}`}>Citizen Mode</button>
              <div className="w-[2px] bg-black"></div>
              <button onClick={() => setPersona('business')} className={`px-4 py-2 transition-colors ${persona === 'business' ? 'bg-blue-400 text-white' : 'bg-neutral-200 text-neutral-500 hover:bg-neutral-100'}`}>Business Mode</button>
            </div>

            {persona === 'citizen' ? (
              <div className="bg-white text-black border-2 border-black px-4 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-right">
                <span className="font-black uppercase tracking-widest text-[10px] block text-neutral-500">Civic Knowledge</span>
                <span className="text-xl font-black text-[#ffc900]">{decodedClauses.size} <span className="text-xs text-black">Decoded</span></span>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-2">
                <div className="bg-white text-black border-2 border-black px-4 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-right w-full">
                  <span className="font-black uppercase tracking-widest text-[10px] block text-neutral-500">Compliance Score</span>
                  <span className="text-xl font-black text-emerald-500">{auditProgress}%</span>
                </div>
                <button 
                  onClick={() => generateAuditReport(user, documentData.title, industry, filteredClauses, checkedItems)}
                  className="bg-emerald-400 text-black border-2 border-black px-4 py-2 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black text-xs uppercase hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Export PDF
                </button>
              </div>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none mb-6">
            {documentData.title}
          </h1>
          
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              placeholder="SEARCH FOR A KEYWORD..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-white border-2 border-black text-black font-bold px-4 py-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all uppercase placeholder-neutral-400 text-sm"
            />
            {persona === 'business' && (
              <select value={industry} onChange={(e) => setIndustry(e.target.value as any)} className="bg-white text-black font-black uppercase border-2 border-black px-4 py-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none cursor-pointer text-sm">
                <option value="general">All Startups</option>
                <option value="ecommerce">E-Commerce Brand</option>
                <option value="gamedev">Game Dev Studio</option>
              </select>
            )}
          </div>
        </div>

        {/* Content Render */}
        {persona === 'citizen' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClauses.map((clause) => {
              const isDecoded = decodedClauses.has(clause.id);
              return (
                <div key={clause.id} onClick={() => handleOpenClause(clause)} className={`bg-white border-4 border-black p-6 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group ${isDecoded ? 'ring-4 ring-[#ffc900] ring-offset-2' : ''}`}>
                  <div>
                    <div className="flex items-start justify-between mb-3 border-b-4 border-black pb-3">
                      <h3 className="text-3xl font-black uppercase">Sec {clause.clause_number}</h3>
                      <div className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-black group-hover:scale-110 transition-transform shrink-0 ${isDecoded ? 'bg-[#ffc900]' : 'bg-neutral-200'}`}>
                        {isDecoded ? '✓' : '→'}
                      </div>
                    </div>
                    {clause.title && <h4 className="text-lg font-bold text-black mb-3 leading-tight uppercase underline decoration-neutral-300 decoration-4 underline-offset-4">{clause.title}</h4>}
                    <p className="text-neutral-600 font-medium line-clamp-3">{clause.content_text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredClauses.length > 0 ? (
              filteredClauses.map((clause) => {
                const isChecked = checkedItems.has(clause.id);
                return (
                  <div key={clause.id} className={`flex flex-col md:flex-row gap-6 p-6 border-4 border-black rounded-2xl transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${isChecked ? 'bg-emerald-50 opacity-80' : 'bg-white'}`}>
                    <div className="shrink-0 flex items-start pt-2">
                      <button onClick={(e) => { e.stopPropagation(); toggleCheck(clause.id); }} className={`w-12 h-12 rounded-xl border-4 border-black flex items-center justify-center transition-all ${isChecked ? 'bg-emerald-400 scale-105 shadow-none translate-x-1 translate-y-1' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-100'}`}>
                        {isChecked && <svg className="w-8 h-8 font-bold text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-400 text-white border-2 border-black px-3 py-1 rounded-md text-sm font-black uppercase tracking-widest">Section {clause.clause_number}</span>
                        {clause.title && <h3 className="text-xl font-black uppercase leading-tight">{clause.title}</h3>}
                      </div>
                      <div className="bg-neutral-100 p-4 rounded-xl border-2 border-black font-bold text-neutral-800 mb-4">
                        {clause.ai_description || "Manual review required. Read core text for exact compliance mechanics."}
                      </div>
                      <button onClick={() => setSelectedClause(clause)} className="text-sm font-black uppercase underline decoration-2 underline-offset-4 hover:text-blue-500 transition-colors">Review Deep Legal Context →</button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 border-4 border-black border-dashed rounded-xl bg-white"><p className="font-black text-2xl uppercase">No compliance items match your current playbook setup.</p></div>
            )}
          </div>
        )}
      </main>

      {/* Pop-up Modal */}
      {selectedClause && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedClause(null)}></div>
          <div className="relative bg-white border-4 border-black rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className={`px-8 py-6 border-b-4 border-black flex justify-between items-start gap-4 ${persona === 'citizen' ? 'bg-[#ffc900]' : 'bg-blue-400 text-white'}`}>
              <div>
                <span className="inline-block px-3 py-1 border-2 border-black rounded-full text-sm font-black mb-2 bg-white text-black">
                  Section {selectedClause.clause_number}
                </span>
                <h2 className="text-3xl font-black uppercase leading-tight">{selectedClause.title || "Section Details"}</h2>
              </div>
              <button onClick={() => setSelectedClause(null)} className="bg-white text-black border-4 border-black hover:bg-red-400 rounded-full p-2 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] shrink-0">
                <svg className="w-6 h-6 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto bg-white flex-1 custom-scrollbar space-y-8 text-black">
              {selectedClause.ai_description && (
                <div className="bg-emerald-50 border-4 border-emerald-500 p-6 rounded-xl shadow-[6px_6px_0px_0px_rgba(16,185,129,0.2)]">
                  <span className="bg-emerald-500 text-white font-black text-xs px-2 py-1 rounded-md uppercase mb-2 inline-block">Simplified Explanation</span>
                  <p className="text-neutral-800 font-bold leading-relaxed">{selectedClause.ai_description}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-xs font-black tracking-widest text-neutral-400 uppercase mb-2">Official Legislative Legalese Text</h4>
                <div className="prose prose-lg max-w-none text-neutral-800 font-medium leading-relaxed whitespace-pre-wrap">{selectedClause.content_text}</div>
              </div>

              {persona === 'citizen' && (
                <div className="pt-6 border-t-4 border-black">
                  {!decodedClauses.has(selectedClause.id) ? (
                    <button 
                      onClick={() => handleDecodeRule(selectedClause.id)}
                      className="w-full py-4 bg-[#ffc900] text-black font-black text-xl tracking-wider rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all uppercase"
                    >
                      ✓ Mark Rule As Decoded
                    </button>
                  ) : (
                    <div className="w-full py-4 bg-emerald-400 text-black font-black text-xl tracking-wider rounded-xl border-4 border-black text-center uppercase flex items-center justify-center gap-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                      Successfully Decoded
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