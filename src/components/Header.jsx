import React from 'react';
import { Bot, Sparkles, FileText, Globe, ShieldCheck, MapPin, Database } from 'lucide-react';

export default function Header({ currency, setCurrency, onOpenLlmTxt, onOpenKbAdmin }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-[#0A0A0A]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Status */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-yellow-400 to-yellow-500 p-0.5 shadow-lg shadow-yellow-500/20">
                <div className="w-full h-full bg-[#121212] rounded-[10px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white uppercase">
                  Mr. Pop <span className="text-yellow-400">Chiang Mai</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/30">
                  <Sparkles className="w-3 h-3 text-yellow-400" /> Since 1956
                </span>
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-500 inline" /> Nimman • Old City • Sridonchai Rd • CNX Airport
              </p>
            </div>
          </div>

          {/* Controls & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Currency Switcher */}
            <div className="flex items-center bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs font-medium">
              <button
                onClick={() => setCurrency('THB')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  currency === 'THB'
                    ? 'bg-yellow-400 text-black shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                ฿ THB
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  currency === 'USD'
                    ? 'bg-yellow-400 text-black shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                $ USD
              </button>
            </div>

            {/* KB Admin Desk Trigger */}
            <button
              onClick={onOpenKbAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-xs font-bold text-yellow-400 hover:bg-yellow-400/20 transition"
              title="Open Knowledge Base Quality & Baseline Admin Desk"
            >
              <Database className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden sm:inline">KB Admin</span>
            </button>

            {/* llms.txt standard trigger */}
            <button
              onClick={onOpenLlmTxt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-yellow-400 hover:border-yellow-400/50 transition"
              title="View AI Crawlable standard spec"
            >
              <FileText className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden md:inline">llms.txt</span>
            </button>

            {/* Verified Badge */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-yellow-400 font-bold bg-yellow-400/10 px-3 py-1.5 rounded-lg border border-yellow-400/30">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              Direct AI Desk Active
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
