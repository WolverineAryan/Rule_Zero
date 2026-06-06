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
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-black text-2xl tracking-tight text-black hover:opacity-80 transition-opacity">
          RULE_ZERO<span className="text-[#ffc900]">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-bold uppercase text-xs tracking-wider text-neutral-600">
          <Link href="/explore" className="hover:text-black transition-colors">Law Vault</Link>
          <Link href="/explore" className="hover:text-black transition-colors">Industry Playbooks</Link>
        </nav>

        <div>
          {user ? (
            <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-full shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.photoURL || ''} alt="Profile" className="w-7 h-7 rounded-full" />
              <span className="font-bold text-xs uppercase text-neutral-700 hidden sm:inline-block">{user.displayName?.split(' ')[0]}</span>
              <button onClick={() => signOut(auth)} className="text-xs font-bold uppercase text-red-500 hover:text-red-700 ml-2">Logout</button>
            </div>
          ) : (
            <Link 
              href="/login"
              className="font-bold text-xs tracking-wider border border-neutral-200 px-5 py-2.5 bg-white text-black rounded-lg shadow-sm hover:shadow-md hover:bg-neutral-50 transition-all uppercase inline-block"
            >
              Sign Up / Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}