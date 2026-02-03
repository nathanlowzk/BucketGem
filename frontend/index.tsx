
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import * as Lucide from 'lucide-react';

// --- Types & Interfaces ---

interface Destination {
  id: string;
  name: string;
  location: string;
  description: string;
  tags: string[];
  imagePrompt: string;
  imageUrl?: string;
  isPersonalized: boolean;
}

interface UserProfile {
  interests: string[];
}

// --- AI Service Layer ---

const MOCK_USER: UserProfile = {
  interests: ['Mountains', 'Adventure', 'Nature', 'Europe'],
};


// --- Components ---

function Button({ children, onClick, variant = 'primary', className = '' }: any) {
  const base = "px-6 py-2 rounded-full font-medium transition-all active:scale-95 flex items-center gap-2";
  const variants: any = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg",
    outline: "border-2 border-slate-200 hover:border-slate-900 text-slate-900",
    ghost: "text-slate-500 hover:text-slate-900"
  };
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

function Toggle({ active, onToggle, label }: { active: boolean, onToggle: () => void, label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className={`text-sm font-semibold tracking-tight transition-colors ${active ? 'text-slate-900' : 'text-slate-400'}`}>
        {label}
      </span>
      <button
        onClick={onToggle}
        className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none ${active ? 'bg-emerald-500' : 'bg-slate-200'}`}
      >
        <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 transform ${active ? 'translate-x-7' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function HeroCarousel({ destinations, loading }: { destinations: Destination[], loading: boolean }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (destinations.length > 0) {
      const timer = setInterval(() => setCurrent(c => (c + 1) % destinations.length), 8000);
      return () => clearInterval(timer);
    }
  }, [destinations.length]);

  if (loading) return (
    <div className="h-[70vh] w-full bg-slate-50 flex flex-col items-center justify-center animate-pulse">
      <Lucide.Loader2 className="w-12 h-12 text-slate-300 animate-spin mb-4" />
      <p className="text-slate-400 font-medium">Fetching the extraordinary...</p>
    </div>
  );

  if (!destinations.length) return null;

  return (
    <div className="relative h-[85vh] w-full overflow-hidden group">
      {destinations.map((dest, idx) => (
        <div
          key={dest.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <img
            src={dest.imageUrl}
            alt={dest.name}
            className="w-full h-full object-cover transform scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-20 left-10 md:left-20 max-w-2xl text-white">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest">
                {dest.isPersonalized ? 'For You' : 'Trending'}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif mb-4 leading-tight">{dest.name}</h1>
            <p className="text-lg md:text-xl text-white/80 font-light mb-8 max-w-lg leading-relaxed">
              {dest.description}
            </p>
            <div className="flex gap-4">
              <Button>Explore Destination</Button>
              <Button variant="ghost" className="text-white hover:bg-white/10 px-4">
                <Lucide.Heart className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-10 right-10 flex gap-4">
        <button
          onClick={() => setCurrent(c => (c - 1 + destinations.length) % destinations.length)}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all"
        >
          <Lucide.ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrent(c => (c + 1) % destinations.length)}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all"
        >
          <Lucide.ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
        {destinations.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 transition-all duration-300 rounded-full ${idx === current ? 'w-8 bg-white' : 'w-2 bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
}

function DestinationCard({ dest }: { dest: Destination }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="group relative flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={dest.imageUrl}
          alt={dest.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <button
          onClick={() => setSaved(!saved)}
          className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all ${saved ? 'bg-rose-500 text-white' : 'bg-black/20 text-white hover:bg-black/40'}`}
        >
          <Lucide.Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
        </button>
        <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap">
          {dest.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-wider rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-1 text-slate-400 text-xs mb-2 font-medium">
          <Lucide.MapPin className="w-3 h-3" />
          {dest.location}
        </div>
        <h3 className="text-xl font-serif text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
          {dest.name}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 font-light leading-relaxed">
          {dest.description}
        </p>
      </div>
    </div>
  );
}

function VoyagerApp() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [personalized, setPersonalized] = useState(false);

  // Inside VoyagerApp component...

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // NOW: We call our own Python backend instead of Google directly
      const response = await fetch('http://127.0.0.1:5001/api/generate-destinations');

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      // Add unique IDs to the data coming from Python
      const formattedData = data.map((d: any, i: number) => ({
        ...d,
        id: `dest-${i}-${Date.now()}`
      }));

      setDestinations(formattedData);
    } catch (err) {
      console.error("Failed to fetch destinations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const displayedDestinations = useMemo(() => {
    if (!personalized) return destinations;
    return destinations.filter(d => d.isPersonalized);
  }, [destinations, personalized]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-emerald-100">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 h-20 flex items-center px-6 md:px-12 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <Lucide.Plane className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-serif tracking-tight">Voyager.</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium hover:text-emerald-600 transition-colors">Destinations</a>
          <a href="#" className="text-sm font-medium hover:text-emerald-600 transition-colors">Journal</a>
          <a href="#" className="text-sm font-medium hover:text-emerald-600 transition-colors">About</a>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-slate-400 hover:text-slate-900 transition-colors">
            <Lucide.User className="w-6 h-6" />
          </button>
          <Button variant="primary" className="hidden sm:flex">Plan Trip</Button>
        </div>
      </nav>

      <main className="pt-20">
        <HeroCarousel destinations={destinations} loading={loading} />

        <section className="max-w-7xl mx-auto px-6 py-12 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-widest text-[10px] uppercase mb-4">
                <Lucide.Sparkles className="w-4 h-4" />
                Curated Collections
              </div>
              <h2 className="text-4xl md:text-5xl font-serif leading-tight max-w-xl">
                {personalized ? 'Personalized Escapes' : 'Trending Destinations'}
              </h2>
            </div>

            <div className="flex flex-col items-start md:items-end gap-4">
              <Toggle
                label="Personalized for Me"
                active={personalized}
                onToggle={() => setPersonalized(!personalized)}
              />
              <p className="text-xs text-slate-400 italic">
                {personalized ? `Showing destinations matching your interests` : 'Showing the global trending collection'}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="aspect-[4/5] bg-slate-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {displayedDestinations.map((dest) => (
                <DestinationCard key={dest.id} dest={dest} />
              ))}
            </div>
          )}

          {!loading && displayedDestinations.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center">
              <Lucide.Compass className="w-16 h-16 text-slate-200 mb-6" />
              <h3 className="text-xl font-serif mb-2">No matching wanderlust found</h3>
              <p className="text-slate-500 font-light mb-8">Try exploring our trending global destinations instead.</p>
              <Button onClick={() => setPersonalized(false)} variant="outline">View All Destinations</Button>
            </div>
          )}
        </section>

        <section className="bg-slate-50 py-24 px-6 mt-12 overflow-hidden relative">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-tight">Ready to start your next adventure?</h2>
            <p className="text-lg text-slate-500 mb-12 font-light max-w-2xl mx-auto">
              Join 50,000+ travelers who use Voyager to plan their dream escapes with AI-powered personal recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-8 py-4 rounded-full border-2 border-slate-200 focus:border-slate-900 outline-none w-full sm:w-96 text-lg transition-all"
              />
              <Button className="py-4 px-10 text-lg">Subscribe</Button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-[120px] opacity-30 -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-[120px] opacity-30 -ml-48 -mb-48" />
        </section>
      </main>

      <footer className="py-12 px-6 md:px-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Lucide.Plane className="text-white w-4 h-4" />
          </div>
          <span className="text-xl font-serif tracking-tight">Voyager.</span>
        </div>
        <p className="text-slate-400 text-sm font-light">© 2025 Voyager Travel Inc. All rights reserved.</p>
        <div className="flex gap-6 text-slate-400">
          <a href="#" className="hover:text-slate-900 transition-colors"><Lucide.Info className="w-5 h-5" /></a>
          <a href="#" className="hover:text-slate-900 transition-colors text-sm font-medium">Privacy</a>
          <a href="#" className="hover:text-slate-900 transition-colors text-sm font-medium">Terms</a>
        </div>
      </footer>

      <style>{`
        @keyframes slow-zoom {
          from { transform: scale(1.0); }
          to { transform: scale(1.15); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s linear infinite alternate;
        }
      `}</style>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<VoyagerApp />);
}
