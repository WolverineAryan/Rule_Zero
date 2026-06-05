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
    <header className="bg-white border-b-4 border-black sticky top-0 z-50 shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] font-sans">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-black text-2xl tracking-tight uppercase hover:skew-x-2 transition-transform">
          Rule_Zero<span className="text-[#ffc900]">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 font-bold uppercase text-sm">
          <Link href="/explore" className="hover:underline underline-offset-4 decoration-4 decoration-[#ffc900]">Law Vault</Link>
          <Link href="/explore" className="hover:underline underline-offset-4 decoration-4 decoration-blue-400">Industry Playbooks</Link>
        </nav>

        <div>
          {user ? (
            <div className="flex items-center gap-3 bg-white border-2 border-black px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.photoURL || ''} alt="Profile" className="w-7 h-7 border border-black rounded-full" />
              <span className="font-black text-xs uppercase hidden sm:inline-block">{user.displayName?.split(' ')[0]}</span>
              <button onClick={() => signOut(auth)} className="text-xs font-black uppercase text-red-500 hover:underline">Logout</button>
            </div>
          ) : (
            <Link 
              href="/login"
              className="font-black text-sm border-2 border-black px-4 py-2 bg-emerald-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase inline-block"
            >
              Sign Up / Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}