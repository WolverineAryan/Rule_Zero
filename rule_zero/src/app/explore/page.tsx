'use client'; 

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Updated types to match the new relational database structure
type Category = {
  id: string;
  name: string;
  slug: string;
};

type Act = {
  id: string;
  title: string;
  enactment_year: number;
  act_categories: { categories: Category }[];
};

export default function ExploreDashboard() {
  const [acts, setActs] = useState<Act[]>([]);
  // We will dynamically extract available categories from the acts
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Laws");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActs() {
      try {
        const res = await fetch('/api/acts');
        const data: Act[] = await res.json();
        setActs(data);
        
        // Magically extract all unique category names that exist in the database
        const extractedCategories = new Set<string>();
        data.forEach(act => {
          act.act_categories.forEach(ac => extractedCategories.add(ac.categories.name));
        });
        setAvailableCategories(["All Laws", ...Array.from(extractedCategories)]);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    }
    fetchActs();
  }, []);

  // Filter the grid based on the dynamically linked categories
  const filteredActs = acts.filter(act => {
    if (selectedCategory === "All Laws") return true;
    
    // Check if the act has a relationship with the selected category
    const hasCategory = act.act_categories.some(ac => ac.categories.name === selectedCategory);
    return hasCategory;
  });

  return (
    <div className="min-h-screen bg-[#f4f4f0] font-sans text-black pb-12 selection:bg-yellow-300">
      <main className="max-w-7xl mx-auto px-6 mt-10">
        
        {/* Dynamic Category Navigation Bar */}
        <div className="flex space-x-4 overflow-x-auto pb-4 mb-8 custom-scrollbar">
          {availableCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap px-6 py-2 rounded-xl text-lg font-bold border-4 border-black transition-all duration-150 cursor-pointer ${
                selectedCategory === category
                  ? 'bg-[#ffc900] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]'
                  : 'bg-white hover:bg-[#ffc900] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-2xl font-black uppercase animate-pulse">Loading Database Catalog...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActs.map((act) => (
              <Link href={`/explore/${act.id}`} key={act.id}>
                <div className="bg-white p-6 h-full rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 transition-all duration-200 cursor-pointer flex flex-col justify-between group">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-black border-2 border-black bg-[#ffc900] mb-4">
                      Year: {act.enactment_year}
                    </span>
                    <h3 className="text-2xl font-black leading-tight mb-3 group-hover:text-neutral-700">
                      {act.title}
                    </h3>
                  </div>
                  <div className="mt-6 pt-4 border-t-4 border-black flex items-center justify-between font-bold text-lg">
                    <span>Explore Document</span>
                    <span className="text-2xl transition-transform group-hover:translate-x-2">→</span>
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