'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <header className="bg-[#FCFAF7] border-b border-[#EBE5DF] sticky top-0 z-50 backdrop-blur-md bg-opacity-90 font-sans text-[#261F1A]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Brand Pivot Geometric Asset */}
        <Link href="/" className="inline-flex items-center gap-2.5 font-bold tracking-tight text-lg group">
          <div className="w-4 h-4 bg-[#DE9E26] rounded-sm transform rotate-45 transition-transform group-hover:rotate-90 duration-300"></div>
          <span>Rule_Zero</span>
        </Link>

        {/* Editorial Sub-Navigation items */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-[#261F1A]/60">
          <Link href="/explore" className="hover:text-black transition-colors">Law Catalog</Link>
          <span className="text-[#EBE5DF]">|</span>
          <span className="text-neutral-400 select-none">System Active Mode</span>
        </nav>

        {/* Dynamic Auth Node Conditionals */}
        <div>
          {user ? (
            <div className="flex items-center gap-4 bg-white border border-[#EBE5DF] pl-2 pr-4 py-1.5 rounded-full shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={user.photoURL || ''} 
                alt="Fiduciary Secure Node Avatar" 
                className="w-6 h-6 rounded-full border border-[#EBE5DF]" 
              />
              <span className="font-bold text-[10px] uppercase tracking-wider text-[#261F1A]/80 hidden sm:inline-block">
                {user.displayName?.split(' ')[0] || "User"}
              </span>
              <span className="w-1 h-1 rounded-full bg-[#DE9E26]" />
              <button 
                onClick={() => signOut(auth)} 
                className="text-[10px] font-bold uppercase tracking-widest text-red-700 hover:text-red-900 transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <Link 
              href="/login"
              className="text-[10px] font-bold uppercase tracking-widest border border-[#261F1A] px-5 py-2.5 bg-[#261F1A] text-white rounded-lg shadow-sm hover:bg-black transition-all inline-block"
            >
              Initialize Node Console
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}