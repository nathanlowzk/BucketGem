import * as Lucide from 'lucide-react';

const FEATURES = [
  {
    icon: Lucide.Sparkles,
    title: 'Personalized Discovery',
    description: 'Our AI learns your travel preferences from your saved destinations and curates recommendations uniquely tailored to your wanderlust.',
  },
  {
    icon: Lucide.Heart,
    title: 'Travel Passport',
    description: 'Build your personal collection of dream destinations. Save the places that inspire you and watch your travel identity take shape.',
  },
  {
    icon: Lucide.Map,
    title: 'Trip Planning',
    description: 'Turn inspiration into action. Plan trips with budgets, dates, companions, and specific places you want to visit — all in one place.',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Explore',
    description: 'Browse curated destinations from around the world, or let our AI surface hidden gems based on your tastes.',
  },
  {
    number: '02',
    title: 'Save',
    description: 'Heart the destinations that speak to you. The more you save, the better we understand your travel style.',
  },
  {
    number: '03',
    title: 'Plan',
    description: 'Ready to go? Create a trip plan with all the details — budget, dates, travel companions, and must-visit spots.',
  },
];

export function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold tracking-widest text-[10px] uppercase mb-6">
            <Lucide.Compass className="w-4 h-4" />
            About Us
          </div>
          <h1 className="text-5xl md:text-7xl font-serif mb-8 leading-tight">
            Travel starts with a
            <span className="text-emerald-600"> spark of curiosity</span>
          </h1>
          <p className="text-xl text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">
            Voyager is a destination discovery platform that helps you find your next
            adventure, save the places that inspire you, and turn dreams into plans.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100 rounded-full blur-[160px] opacity-20 -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100 rounded-full blur-[140px] opacity-20 -ml-48 -mb-48" />
      </section>

      {/* Mission */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-50 rounded-3xl p-10 md:p-14 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-widest text-[10px] uppercase mb-4">
                <Lucide.Target className="w-4 h-4" />
                Our Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-serif mb-6 leading-tight">
                Making travel planning feel like travel itself
              </h2>
              <p className="text-lg text-slate-500 font-light leading-relaxed mb-4">
                We believe the best trips start long before you board a plane. They begin
                with that moment of discovery — stumbling upon a place you never knew existed,
                or seeing a familiar destination in a completely new light.
              </p>
              <p className="text-lg text-slate-500 font-light leading-relaxed">
                Voyager uses AI to surface destinations that match your unique travel personality,
                built from the places you love. No generic top-10 lists — just places that feel
                like they were meant for you.
              </p>
            </div>
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-100 rounded-full opacity-40" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold tracking-widest text-[10px] uppercase mb-4">
              <Lucide.Layers className="w-4 h-4" />
              Features
            </div>
            <h2 className="text-3xl md:text-4xl font-serif">
              Everything you need, nothing you don't
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-8 rounded-2xl border-2 border-slate-100 hover:border-emerald-200 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-serif mb-3">{feature.title}</h3>
                  <p className="text-slate-500 font-light leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold tracking-widest text-[10px] uppercase mb-4">
              <Lucide.Route className="w-4 h-4" />
              How It Works
            </div>
            <h2 className="text-3xl md:text-4xl font-serif">
              Three steps to your next adventure
            </h2>
          </div>

          <div className="space-y-8">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className="flex items-start gap-6 md:gap-10"
              >
                <div className="shrink-0 w-14 h-14 bg-white rounded-2xl border-2 border-emerald-200 flex items-center justify-center shadow-sm">
                  <span className="text-lg font-serif text-emerald-600">{step.number}</span>
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-serif mb-2">{step.title}</h3>
                  <p className="text-slate-500 font-light leading-relaxed">
                    {step.description}
                  </p>
                  {i < STEPS.length - 1 && (
                    <div className="w-px h-8 bg-emerald-200 ml-0 mt-6 md:hidden" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <Lucide.Plane className="w-8 h-8 text-emerald-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-serif mb-6 leading-tight">
            Built for dreamers, planners, and everyone in between
          </h2>
          <p className="text-lg text-slate-500 font-light leading-relaxed max-w-2xl mx-auto">
            Voyager is a passion project, built with the belief that everyone deserves
            travel experiences that feel personal. We're constantly improving our recommendations
            and adding new features to help you discover the world on your own terms.
          </p>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-50 rounded-full blur-[200px] opacity-30" />
      </section>
    </div>
  );
}
