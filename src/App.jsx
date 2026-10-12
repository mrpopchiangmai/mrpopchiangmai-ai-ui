import React, { useState, useMemo } from 'react';
import { CopilotKit, useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

import Header from './components/Header';
import ConversationalSearch from './components/ConversationalSearch';
import VehicleCard from './components/VehicleCard';
import VisionAiVerification from './components/VisionAiVerification';
import CheckoutModal from './components/CheckoutModal';
import LlmTxtModal from './components/LlmTxtModal';
import KbAdminModal from './components/KbAdminModal';
import Footer from './components/Footer';
import { FLEET_DATA } from './data/fleet';
import { queryFreeTierLlm } from './services/ai';
import { Sparkles, Bot, ShieldCheck, MapPin, Zap } from 'lucide-react';

function MrPopRentalApp() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [currency, setCurrency] = useState('THB'); // 'THB' or 'USD'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState(null);

  // Modal states
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [verifiedDoc, setVerifiedDoc] = useState(null);
  const [step, setStep] = useState(null); // 'vision-ai' | 'checkout' | null
  const [showLlmModal, setShowLlmModal] = useState(false);
  const [showKbAdmin, setShowKbAdmin] = useState(false);

  // Make fleet readable to AG-UI Agent
  useCopilotReadable({
    description: "Current motorbike fleet inventory, rates, and deposit requirements at Mr. Pop Chiang Mai",
    value: FLEET_DATA
  });

  // AG-UI Protocol Action: Calculate Price & Filter Fleet
  useCopilotAction({
    name: "calculateMotorbikeRentalPrice",
    description: "Calculates total rental cost and filters motorbikes matching customer route, dates, or model request",
    parameters: [
      {
        name: "vehicleName",
        type: "string",
        description: "Name of the requested bike (e.g. Honda Click 125cc, Triumph Scrambler 400X, Yamaha NMAX)",
        required: true
      },
      {
        name: "days",
        type: "number",
        description: "Total rental duration in days",
        required: true
      },
      {
        name: "category",
        type: "string",
        description: "Category: Adventure Bikes | Premium Scooters | City Scooters | Sports Bikes | Touring Accessories"
      }
    ],
    handler: async ({ vehicleName, days, category }) => {
      setQuery(`${vehicleName} for ${days} days`);
      if (category) setActiveCategory(category);
      const res = await queryFreeTierLlm(`${vehicleName} for ${days} days`);
      if (res) {
        setAiInterpretation(res.resolvedIntent + ' ' + (res.replyMessage || ''));
      }
      return `Price calculated for ${vehicleName} (${days} days): ฿${res?.totalPriceThb || 0} THB. Filter applied to UI.`;
    }
  });

  // AI-filtered fleet computation
  const filteredFleet = useMemo(() => {
    return FLEET_DATA.filter((item) => {
      // Category filter
      if (activeCategory !== 'All' && item.category !== activeCategory) {
        return false;
      }

      // Query filter matching name, specs, category, or badges
      if (!query.trim()) return true;
      const q = query.toLowerCase();

      // Check name, category, or badges
      if (
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.suitability.toLowerCase().includes(q) ||
        item.badges.some((b) => b.toLowerCase().includes(q))
      ) {
        return true;
      }

      // Special keywords matching vehicle types
      if (q.includes('click') && item.id.includes('click')) return true;
      if ((q.includes('scrambler') || q.includes('triumph')) && item.id.includes('scrambler')) return true;
      if (q.includes('nmax') && item.id.includes('nmax')) return true;
      if ((q.includes('vstrom') || q.includes('v-strom')) && item.id.includes('vstrom')) return true;
      if (q.includes('transalp') && item.id.includes('transalp')) return true;

      return false;
    });
  }, [query, activeCategory]);

  // AI search submission handling
  const handleSearchSubmit = async (overrideQuery) => {
    const q = overrideQuery !== undefined ? overrideQuery : query;
    if (!q.trim()) {
      setAiInterpretation(null);
      return;
    }

    setIsAnalyzing(true);
    const result = await queryFreeTierLlm(q);
    setIsAnalyzing(false);
    
    if (result) {
      setAiInterpretation(result.resolvedIntent + ' ' + (result.replyMessage || ''));
      if (result.matchedCategory && result.matchedCategory !== 'All') {
        setActiveCategory(result.matchedCategory);
      }
    }
  };

  // Launch booking pipeline
  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setStep('vision-ai');
  };

  // Handle document verification success
  const handleDocumentVerified = (docData) => {
    setVerifiedDoc(docData);
    setStep('checkout');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col justify-between selection:bg-yellow-400 selection:text-black">
      
      {/* Sticky Header */}
      <Header
        currency={currency}
        setCurrency={setCurrency}
        onOpenLlmTxt={() => setShowLlmModal(true)}
        onOpenKbAdmin={() => setShowKbAdmin(true)}
      />

      {/* Hero & AI Conversational Bar */}
      <ConversationalSearch
        query={query}
        setQuery={setQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        onSearchSubmit={handleSearchSubmit}
        isAnalyzing={isAnalyzing}
        aiInterpretation={aiInterpretation}
      />

      {/* Main Vehicle Fleet Stream */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        
        {/* Stream Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase flex items-center gap-2 tracking-tight">
              Available Fleet & Gear
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-900 text-yellow-400 font-bold border border-zinc-800">
                {filteredFleet.length} items
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Every bike includes 2 free helmets, 24/7 roadside assistance, and full insurance options.
            </p>
          </div>

          {(query || activeCategory !== 'All') && (
            <button
              onClick={() => {
                setQuery('');
                setActiveCategory('All');
                setAiInterpretation(null);
              }}
              className="text-xs text-yellow-400 hover:text-yellow-300 underline font-bold uppercase"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Fleet Grid */}
        {filteredFleet.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFleet.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                currency={currency}
                onSelectVehicle={handleSelectVehicle}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-zinc-900/50 rounded-2xl border border-zinc-800 p-8">
            <Bot className="w-12 h-12 text-yellow-400 mx-auto mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-white uppercase">No exact motorbike matches found</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              Try adjusting your AI prompt or select "All" to see available scooters, adventure bikes, and touring gear in Chiang Mai.
            </p>
            <button
              onClick={() => {
                setQuery('');
                setActiveCategory('All');
                setAiInterpretation(null);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-yellow-400 text-black font-black text-xs uppercase"
            >
              Show Full Fleet
            </button>
          </div>
        )}

        {/* Why Rent with Mr. Pop AI Section */}
        <section className="mt-16 pt-10 border-t border-zinc-800">
          <div className="text-center mb-8">
            <h3 className="text-lg sm:text-2xl font-black text-white uppercase">
              Why Choose <span className="text-yellow-400">Mr. Pop Chiang Mai</span>
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              Serving riders in Chiang Mai since 1956 — now enhanced with instant AG-UI Protocol
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-left">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm uppercase">AG-UI Protocol Agent</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Bi-directional event streaming protocols connecting agentic reasoning directly to UI state.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-left">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/30 text-red-500 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm uppercase">Vision AI Passport Verification</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Scan your passport and International Driving Permit (IDP) in seconds. 100% paperless onboarding.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-left">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm uppercase">Hotel & Airport Delivery</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Pickup at Sridonchai Rd main shop, Nimman, Old City, or delivered directly to CNX Airport.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />

      {/* AG-UI Protocol Copilot Popup Assistant */}
      <CopilotPopup
        instructions="You are Mr. Pop's AI Assistant. Help tourists calculate prices for motorbikes (Honda Click, Scrambler 400, NMAX, V-Strom) and guide them to rent in Chiang Mai."
        labels={{
          title: "Mr. Pop AG-UI Assistant",
          initial: "Sawatdee krub! I'm Mr. Pop's AG-UI Agent. Ask me for bike rental quotes, dates, or route tips in Chiang Mai!"
        }}
      />

      {/* Modals */}
      {step === 'vision-ai' && selectedVehicle && (
        <VisionAiVerification
          vehicle={selectedVehicle}
          currency={currency}
          onClose={() => setStep(null)}
          onVerified={handleDocumentVerified}
        />
      )}

      {step === 'checkout' && selectedVehicle && (
        <CheckoutModal
          vehicle={selectedVehicle}
          verifiedDoc={verifiedDoc}
          currency={currency}
          onClose={() => setStep(null)}
        />
      )}

      {showLlmModal && (
        <LlmTxtModal onClose={() => setShowLlmModal(false)} />
      )}

      {showKbAdmin && (
        <KbAdminModal onClose={() => setShowKbAdmin(false)} />
      )}

    </div>
  );
}

export default function App() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <MrPopRentalApp />
    </CopilotKit>
  );
}
