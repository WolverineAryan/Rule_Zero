'use client';

import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Auto-redirect if they are already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/explore');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGoogleAuth = async () => {
    setIsAuthenticating(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/explore');
    } catch (error) {
      console.error("Authentication failed", error);
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-white p-6 font-sans">
      
      {/* 🚀 THE SPLIT-THEME AUTH CARD */}
      <div className="max-w-md w-full border-4 border-black rounded-2xl overflow-hidden shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col transition-all hover:-translate-y-1 hover:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
        
        {/* TOP HALF: THEME YELLOW */}
        <div className="bg-[#ffc900] p-8 md:p-10 text-center border-b-4 border-black">
          <div className="w-16 h-16 bg-white border-4 border-black rounded-full mx-auto mb-4 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-black leading-none">
            Welcome<br/>Back
          </h1>
        </div>

        {/* BOTTOM HALF: THEME BEIGE */}
        <div className="bg-[#f4f4f0] p-8 md:p-10 text-center">
          <p className="text-neutral-800 font-bold mb-8 uppercase text-sm leading-relaxed tracking-wide">
            Sign in to access your saved compliance reports and civic scores.
          </p>

          <button 
            onClick={handleGoogleAuth}
            disabled={isAuthenticating}
            className="w-full flex items-center justify-center gap-4 py-4 bg-black text-white border-4 border-black rounded-xl hover:bg-neutral-800 hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(255,201,0,1)] transition-all uppercase font-black disabled:opacity-50 text-lg"
          >
            {isAuthenticating ? "Authenticating..." : "Sign in with Google"}
          </button>

          <div className="mt-8 border-t-4 border-black border-dashed pt-6">
            <p className="text-sm font-bold text-neutral-600 uppercase tracking-widest">
              Don't have an account? <br/>
              <Link href="/signup" className="text-black font-black hover:bg-[#ffc900] hover:text-black px-2 py-1 transition-colors mt-2 inline-block border-2 border-transparent hover:border-black rounded-md">
                Create Account →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}