'use client'; 

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Category = { id: string; name: string; slug: string; };
type Act = { id: string; title: string; enactment_year: number; act_categories: { categories: Category }[]; };

export default function ExploreDashboard() {
  const [acts, setActs] = useState<Act[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Indexed Laws");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActs() {
      try {
        const res = await fetch('/api/acts');
        const data: Act[] = await res.json();
        setActs(data);
        const extractedCategories = new Set<string>();
        data.forEach(act => act.act_categories.forEach(ac => extractedCategories.add(ac.categories.name)));
        setAvailableCategories(["All Indexed Laws", ...Array.from(extractedCategories)]);
        setLoading(false);
      } catch (error) {
        console.error("Pipeline read error", error);
        setLoading(false);
      }
    }
    fetchActs();
  }, []);

  const filteredActs = acts.filter(act => {
    if (selectedCategory === "All Indexed Laws") return true;
    return act.act_categories.some(ac => ac.categories.name === selectedCategory);
  });

  return (
    <div className="min-h-screen bg-[#FCFAF7] font-sans text-[#261F1A] pb-24 selection:bg-[#DE9E26]/20">
      <main className="max-w-6xl mx-auto px-6 pt-16">
        
        {/* Page Header Matrix */}
        <div className="mb-12 border-b border-[#EBE5DF] pb-8">
          <span className="text-[#DE9E26] text-[10px] font-bold uppercase tracking-widest block mb-2">// Repository Registry</span>
          <h1 className="text-4xl font-serif font-normal tracking-tight mb-3">The Legislative Ledger</h1>
          <p className="text-xs text-[#261F1A]/60 font-medium">Select an analytical context filter below to isolate operational compliance modules.</p>
        </div>

        {/* Minimal Architectural Navigation Track */}
        <div className="flex space-x-8 overflow-x-auto pb-4 mb-12 border-b border-[#EBE5DF]/60 custom-scrollbar scroll-smooth">
          {availableCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-200 relative top-[2px] ${
                selectedCategory === category
                  ? 'border-[#DE9E26] text-[#261F1A]'
                  : 'border-transparent text-[#261F1A]/40 hover:text-[#261F1A]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-5 h-5 border-2 border-[#EBE5DF] border-t-[#DE9E26] rounded-full animate-spin"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#261F1A]/40">Syncing Ledger Index...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#EBE5DF] border border-[#EBE5DF] rounded-2xl overflow-hidden shadow-sm shadow-[#261F1A]/5">
            {filteredActs.map((act) => (
              <Link href={`/explore/${act.id}`} key={act.id} className="block group">
                <div className="bg-white p-8 h-full flex flex-col justify-between transition-all duration-300 group-hover:bg-[#FCFAF7]">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-[#DE9E26] bg-[#FCFAF7] border border-[#EBE5DF] px-2.5 py-1 rounded">
                        Est. {act.enactment_year}
                      </span>
                      <span className="text-[10px] font-bold text-[#261F1A]/30 tracking-tighter group-hover:text-[#DE9E26] transition-colors">
                        // 0x{act.id.substring(0, 4).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-xl font-serif font-normal leading-snug text-[#261F1A] group-hover:text-black transition-colors">
                      {act.title}
                    </h3>
                  </div>
                  
                  <div className="mt-12 pt-4 border-t border-[#FCFAF7] flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#261F1A]/40 group-hover:text-[#261F1A] transition-colors">
                    <span>Initialize Blueprint</span>
                    <span className="text-sm transform group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}