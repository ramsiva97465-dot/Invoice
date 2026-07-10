import React from 'react';
import { ArrowRight, CheckCircle, Zap, Globe, Send } from 'lucide-react';
import logoImg from '../assets/logo.png';

interface LandingProps {
  onLoginClick: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onLoginClick }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-lg shadow-emerald-500/10">
              <img src={logoImg} alt="Xivora Logo" className="h-8 w-auto" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Xivora
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden md:block">Features</a>
            <a href="#pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden md:block">Pricing</a>
            <button 
              onClick={onLoginClick}
              className="text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-full transition-colors"
            >
              Log in
            </button>
            <button 
              onClick={onLoginClick}
              className="text-sm font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 px-5 py-2.5 rounded-full transition-colors flex items-center gap-2"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-sm text-emerald-400 font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Xivora SaaS is now Live
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Invoicing made <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">effortless</span> for modern businesses.
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create professional invoices, send them instantly via WhatsApp, and get paid faster. The all-in-one billing platform designed for speed and simplicity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onLoginClick}
              className="w-full sm:w-auto text-base font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 px-8 py-4 rounded-full transition-colors flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20"
            >
              Start for free <ArrowRight className="h-5 w-5" />
            </button>
            <p className="text-sm text-slate-500 sm:hidden">No credit card required.</p>
          </div>
          <div className="mt-16 relative mx-auto max-w-5xl">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-2 shadow-2xl backdrop-blur-sm">
              <div className="rounded-xl overflow-hidden bg-slate-950 aspect-video relative flex items-center justify-center border border-slate-800">
                {/* Mockup Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 flex flex-col items-center justify-center">
                   <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl p-6 transform rotate-[-2deg] opacity-80">
                     <div className="flex justify-between items-center mb-6">
                        <div className="h-8 w-32 bg-slate-200 rounded"></div>
                        <div className="h-8 w-16 bg-emerald-100 rounded"></div>
                     </div>
                     <div className="space-y-3">
                       <div className="h-4 w-full bg-slate-100 rounded"></div>
                       <div className="h-4 w-5/6 bg-slate-100 rounded"></div>
                       <div className="h-4 w-4/6 bg-slate-100 rounded"></div>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to run your business</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Xivora replaces multiple tools with one unified, blazing-fast platform.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl hover:border-emerald-500/30 transition-colors">
              <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-400">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Generate beautiful PDF invoices in milliseconds. Our optimized engine ensures you spend less time on admin.</p>
            </div>
            
            <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl hover:border-blue-500/30 transition-colors">
              <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-400">
                <Send className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">WhatsApp Native</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Share invoices directly to your customer's WhatsApp with one tap using native mobile sharing integrations.</p>
            </div>
            
            <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl hover:border-purple-500/30 transition-colors">
              <div className="h-12 w-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-400">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Multi-Lingual</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Operate in English, Hindi, or Tamil seamlessly. Xivora adapts to your preferred business language.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 border-t border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Start for free, upgrade when you need to.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-slate-400 mb-6">Perfect for freelancers and small businesses.</p>
              <div className="mb-8">
                <span className="text-5xl font-extrabold">₹0</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle className="h-5 w-5 text-emerald-500" /> Up to 5 invoices per month
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle className="h-5 w-5 text-emerald-500" /> Standard PDF Template
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle className="h-5 w-5 text-emerald-500" /> WhatsApp Sharing
                </li>
              </ul>
              <button 
                onClick={onLoginClick}
                className="w-full py-3.5 rounded-xl border border-slate-700 hover:bg-slate-800 font-bold transition-colors"
              >
                Get Started Free
              </button>
            </div>
            
            {/* Pro Tier */}
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-emerald-500/50 rounded-3xl p-8 flex flex-col relative shadow-2xl shadow-emerald-500/10">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-emerald-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Professional</h3>
              <p className="text-slate-400 mb-6">For growing businesses that need more power.</p>
              <div className="mb-8">
                <span className="text-5xl font-extrabold text-white">₹499</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-white">
                  <CheckCircle className="h-5 w-5 text-emerald-400" /> <strong>Unlimited invoices</strong>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <CheckCircle className="h-5 w-5 text-emerald-400" /> Custom branding & logos
                </li>
                <li className="flex items-center gap-3 text-white">
                  <CheckCircle className="h-5 w-5 text-emerald-400" /> Priority Support
                </li>
                <li className="flex items-center gap-3 text-white">
                  <CheckCircle className="h-5 w-5 text-emerald-400" /> Advanced Analytics
                </li>
              </ul>
              <button 
                onClick={onLoginClick}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="Xivora" className="h-6 grayscale opacity-50" />
            <span>© {new Date().getFullYear()} Xivora. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
