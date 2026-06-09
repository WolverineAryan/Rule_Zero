'use client';

import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/explore");
    } catch (error) {
      console.error("Auth Pipeline Failure", error);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FCFAF7] text-[#261F1A] font-sans overflow-hidden relative selection:bg-[#DE9E26]/20">
      
      {/* LEFT PANEL: Branding & Architectural Geometry */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#261F1A] p-16 flex-col justify-between relative overflow-hidden border-r border-[#261F1A]">
        {/* Subtle geometric line art */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-px h-full bg-white"></div>
          <div className="absolute top-1/3 left-0 w-full h-px bg-white"></div>
          <div className="absolute bottom-1/4 -left-10 w-96 h-96 border border-white rounded-full"></div>
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 text-white font-bold tracking-tight text-lg group">
            <div className="w-4 h-4 bg-[#DE9E26] rounded-sm transform rotate-45 transition-transform group-hover:rotate-90 duration-300"></div>
            <span>Rule_Zero</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-sm">
          <span className="text-[#DE9E26] text-[10px] font-bold uppercase tracking-widest block mb-4">// System Node 01</span>
          <h2 className="text-4xl font-serif font-light text-white leading-tight mb-6">
            Enter the corporate governance interface.
          </h2>
          <p className="text-neutral-400 text-xs font-medium leading-relaxed">
            Access secure cloud execution layers to resume tracking startup data structures, monitoring fiduciaries, and parsing live legislative code.
          </p>
        </div>

        <div className="relative z-10 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
          © {new Date().getFullYear()} Rule_Zero OS
        </div>
      </div>

      {/* RIGHT PANEL: Minimalist Auth Core */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 md:p-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#DE9E26]/5 rounded-full blur-[100px] pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Mobile Only Header */}
          <div className="lg:hidden mb-12">
            <div className="w-4 h-4 bg-[#DE9E26] rounded-sm transform rotate-45 mb-4"></div>
            <h1 className="text-xl font-bold tracking-tight">Rule_Zero</h1>
          </div>

          <div className="mb-10">
            <h3 className="text-3xl font-serif font-normal tracking-tight text-[#261F1A] mb-3">Client Authentication</h3>
            <p className="text-xs text-[#261F1A]/60 font-medium">Verify your administrative identity via Google OAuth protocol.</p>
          </div>

          <div className="space-y-6">
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-[#261F1A] text-white font-bold text-xs uppercase tracking-widest py-4.5 rounded-xl shadow-md shadow-[#261F1A]/10 hover:bg-black transition-all border border-[#261F1A]"
            >
              <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </motion.button>
          </div>

          <div className="mt-12 pt-6 border-t border-[#EBE5DF] text-center text-xs font-bold text-[#261F1A]/50 uppercase tracking-widest">
            Unregistered instance? <Link href="/signup" className="text-[#DE9E26] underline ml-1 hover:text-[#C98D1E] transition-colors">Provision node</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}