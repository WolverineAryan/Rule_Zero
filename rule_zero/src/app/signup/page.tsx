'use client';

import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SignupPage() {
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
            <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-black leading-none">
            Join<br/>Rule_Zero
          </h1>
        </div>

        {/* BOTTOM HALF: THEME BEIGE */}
        <div className="bg-[#f4f4f0] p-8 md:p-10 text-center">
          <p className="text-neutral-800 font-bold mb-8 uppercase text-sm leading-relaxed tracking-wide">
            Create your free account to track legal compliance and decode regulations.
          </p>

          <button 
            onClick={handleGoogleAuth}
            disabled={isAuthenticating}
            className="w-full flex items-center justify-center gap-4 py-4 bg-black text-white border-4 border-black rounded-xl hover:bg-neutral-800 hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(255,201,0,1)] transition-all uppercase font-black disabled:opacity-50 text-lg"
          >
            {isAuthenticating ? "Creating Account..." : "Sign up with Google"}
          </button>

          <div className="mt-8 border-t-4 border-black border-dashed pt-6">
            <p className="text-sm font-bold text-neutral-600 uppercase tracking-widest">
              Already have an account? <br/>
              <Link href="/login" className="text-black font-black hover:bg-[#ffc900] hover:text-black px-2 py-1 transition-colors mt-2 inline-block border-2 border-transparent hover:border-black rounded-md">
                Log In Instead →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}