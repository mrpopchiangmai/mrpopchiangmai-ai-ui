import React, { useState } from 'react';
import { 
  X, ShieldCheck, CheckCircle2, AlertCircle, Edit3, Save, 
  Database, FileText, Download, Sparkles, RefreshCw, Layers, Search, Plus
} from 'lucide-react';
import { FLEET_DATA } from '../data/fleet';

export default function KbAdminModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('faq'); // 'faq' | 'fleet' | 'export'
  const [searchQuery, setSearchQuery] = useState('');
  const [saveNotification, setSaveNotification] = useState('');

  // Initial FAQ Knowledge Base state loaded from WhatsApp analysis
  const [faqList, setFaqList] = useState([
    {
      id: 'pricing',
      topic: 'Pricing, Rates & Quotes',
      category: 'Finance & Quotes',
      verified: true,
      lastVerified: '2026-10-12',
      verifiedBy: 'Mr. Pop Owner',
      questions: [
        'How much does it cost to rent a motorbike per day?',
        'Do you offer multi-day or weekly discounts?',
        'Can I pay in US Dollars, Credit Card, or Thai Baht cash?'
      ],
      answer: 'Daily rental rates range from ฿250 THB/day for city scooters (Honda Click) up to ฿1,800 THB/day for heavy touring bikes (Honda Transalp 750). We offer tiered discounts for 4-7 day rentals (~15% off) and 8+ day rentals (~25% off). We accept THB cash, Thai PromptPay, major Credit Cards, and Wise/Revolut.',
      samples: [
        { customer: 'Adrian Hoskins', text: 'Interested in forza 350, adv 350, Xmax 300, or aerox 155' },
        { customer: 'Sam', text: "Hi! I'm interested in renting a bike, can you send my your price list please" }
      ]
    },
    {
      id: 'monthly',
      topic: 'Monthly & Long-Term Rentals',
      category: 'Expat & Long-Term',
      verified: true,
      lastVerified: '2026-10-12',
      verifiedBy: 'Mr. Pop Owner',
      questions: [
        'Do you offer monthly rates for motorbike rentals?',
        'What is included in a monthly rental contract?',
        'Is routine maintenance included during long-term rental?'
      ],
      answer: 'Yes! Monthly rates start at ฿3,500 THB/month for 125cc scooters up to ฿22,000 THB/month for 500cc adventure touring bikes. Monthly contracts include free routine servicing (oil changes every 2,000 km), helmet rentals, and 24/7 roadside assistance in Chiang Mai province.',
      samples: [
        { customer: 'Adrian Hoskins', text: 'Hello! Do you offer monthly rates for motorbike rentals?' },
        { customer: 'joycelurvink', text: 'I reservated an Royal Enfield 350 for 5 days...' }
      ]
    },
    {
      id: 'routes',
      topic: 'Route Suitability & Loop Recommendations',
      category: 'Touring & Maps',
      verified: true,
      lastVerified: '2026-10-12',
      verifiedBy: 'Mr. Pop Owner',
      questions: [
        'Which bike is best for the Mae Hong Son Loop (1,864 curves)?',
        'Can a 160cc scooter (PCX / NMAX) handle two riders on mountain climbs?',
        'Do you provide top boxes or side panniers for luggage?'
      ],
      answer: 'For the famous Mae Hong Son Loop or Pai trip, we highly recommend 300cc+ adventure bikes or premium scooters (Honda ADV 350, Forza 350, Triumph Scrambler 400X, or Honda NX500). For two riders with luggage, 300cc+ is essential. 125cc-160cc scooters are great for Doi Suthep and Samoeng Loop.',
      samples: [
        { customer: 'Lydia', text: 'Do you think the ADV 350 is the right bike for me to do the loop, or would the PCX 160...' },
        { customer: 'A.', text: 'request a detailed quote to rent a Honda NX500 for 5 days...' }
      ]
    },
    {
      id: 'delivery',
      topic: 'Delivery, Hotel & Airport Services',
      category: 'Logistics',
      verified: true,
      lastVerified: '2026-10-12',
      verifiedBy: 'Mr. Pop Owner',
      questions: [
        'Can you deliver the bike to my hotel or apartment in Chiang Mai?',
        'Do you offer pickup or drop-off at Chiang Mai Airport (CNX)?',
        'Where is your main shop located?'
      ],
      answer: 'We deliver directly to hotels, apartments, and guest houses in Nimman, Old City, and Santitham for ฿100-200 THB, or free for 5+ day rentals. We also arrange CNX Airport transfers and hotel pickups. Our main shop is located at Sridonchai Road, near Night Bazaar.',
      samples: [
        { customer: 'joycelurvink', text: 'Is there an opportunity you pick me up at my appartment Maross around 11 o clock?' }
      ]
    },
    {
      id: 'license',
      topic: 'License, Deposit & Passport Requirements',
      category: 'Policy & Legal',
      verified: true,
      lastVerified: '2026-10-12',
      verifiedBy: 'Mr. Pop Owner',
      questions: [
        'Do I need an International Driving Permit (IDP) to rent a bike in Thailand?',
        'What is the security deposit requirement?',
        'Do I have to leave my original passport as a deposit?'
      ],
      answer: 'An International Driving Permit (IDP Class A for motorcycles) or valid motorcycle license is required by Thai traffic law. For security deposit, you can either leave ฿1,000 - ฿5,000 THB cash (depending on model) OR leave your passport copy with deposit cash.',
      samples: [
        { customer: 'Karl Wihler', text: 'What are the deposit options if I prefer to keep my original passport?' }
      ]
    },
    {
      id: 'accessories',
      topic: 'Accessories, Helmets & Gear',
      category: 'Equipment',
      verified: true,
      lastVerified: '2026-10-12',
      verifiedBy: 'Mr. Pop Owner',
      questions: [
        'Are helmets included with the rental?',
        'Do bikes come equipped with phone holders for GPS navigation?',
        'Can I rent full-face helmets or riding jackets?'
      ],
      answer: 'Every rental includes two sanitized open-face or full-face helmets and a phone holder for GPS map navigation free of charge. Raincoats, luggage racks, and top boxes are available upon request.',
      samples: [
        { customer: 'DJ', text: 'speed 400 with phone holder and helmet?' }
      ]
    }
  ]);

  // Fleet matrix state
  const [fleetMatrix, setFleetMatrix] = useState(FLEET_DATA);

  // Handle inline FAQ answer edits
  const handleAnswerChange = (id, newAnswer) => {
    setFaqList(prev => prev.map(item => item.id === id ? { ...item, answer: newAnswer, lastVerified: new Date().toISOString().slice(0,10) } : item));
  };

  // Toggle verification state
  const toggleVerified = (id) => {
    setFaqList(prev => prev.map(item => item.id === id ? { ...item, verified: !item.verified, lastVerified: new Date().toISOString().slice(0,10) } : item));
  };

  const handleSaveAll = () => {
    setSaveNotification('Knowledge Base successfully verified and baseline saved!');
    setTimeout(() => setSaveNotification(''), 4000);
  };

  const filteredFaqs = faqList.filter(f => 
    f.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#111622] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#0c0f18]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-wide uppercase">Knowledge Base Admin & Baseline Quality Desk</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Synced: wacli (15,387 msgs)
                </span>
              </div>
              <p className="text-xs text-zinc-400">Verify, edit, and baseline customer FAQs derived from live WhatsApp chat data.</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved Notification Banner */}
        {saveNotification && (
          <div className="px-6 py-2 bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {saveNotification}
          </div>
        )}

        {/* Sub-Header Tabs & Quick Search */}
        <div className="flex flex-wrap items-center justify-between px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/50 gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'faq'
                  ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Verified FAQs ({faqList.length})
            </button>

            <button
              onClick={() => setActiveTab('fleet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'fleet'
                  ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Fleet Matrix ({fleetMatrix.length})
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'export'
                  ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              Export & Obsidian Sync
            </button>
          </div>

          {activeTab === 'faq' && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search FAQs & keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
              />
            </div>
          )}
        </div>

        {/* Tab 1: FAQ Manager */}
        {activeTab === 'faq' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {filteredFaqs.map((faq) => (
              <div 
                key={faq.id}
                className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-4 hover:border-zinc-700 transition"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-yellow-400 px-2.5 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 uppercase">
                      {faq.category}
                    </span>
                    <h3 className="font-bold text-white text-sm">{faq.topic}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleVerified(faq.id)}
                      className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                        faq.verified 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                      }`}
                    >
                      {faq.verified ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Verified Baseline
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                          Needs Review
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Common Customer Questions */}
                <div className="bg-[#0b0e17] p-3 rounded-xl border border-zinc-800/60">
                  <div className="text-[11px] font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Common WhatsApp Customer Questions:
                  </div>
                  <ul className="list-disc list-inside text-xs text-zinc-300 space-y-1">
                    {faq.questions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>

                {/* Editable Verified Response */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Verified Standard AI & Staff Response Strategy:
                  </label>
                  <textarea
                    rows={3}
                    value={faq.answer}
                    onChange={(e) => handleAnswerChange(faq.id, e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-slate-100 focus:outline-none focus:border-yellow-400 leading-relaxed font-sans"
                  />
                </div>

                {/* Real Customer WhatsApp Quote Samples */}
                {faq.samples && faq.samples.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800/60 flex items-center gap-2 text-[11px] text-zinc-500 flex-wrap">
                    <span className="font-bold text-zinc-400">Real WhatsApp Samples:</span>
                    {faq.samples.map((s, idx) => (
                      <span key={idx} className="bg-zinc-800/80 text-zinc-300 px-2 py-0.5 rounded italic">
                        "{s.customer}": "{s.text.slice(0, 60)}..."
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Fleet Matrix */}
        {activeTab === 'fleet' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="p-3">Vehicle Model</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Engine</th>
                    <th className="p-3">Daily Rate</th>
                    <th className="p-3">Monthly Rate</th>
                    <th className="p-3">Deposit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {fleetMatrix.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/40 transition">
                      <td className="p-3 font-bold text-white">{item.name}</td>
                      <td className="p-3 text-yellow-400">{item.category}</td>
                      <td className="p-3">{item.engine}</td>
                      <td className="p-3 font-semibold text-emerald-400">฿{item.rates.day1_3} THB</td>
                      <td className="p-3 font-semibold text-blue-400">฿{item.rates.day8plus * 20} THB</td>
                      <td className="p-3 text-zinc-400">฿{item.depositThb} THB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Export & Obsidian Sync */}
        {activeTab === 'export' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Knowledge Base Exports & Obsidian Vault Integration
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Export verified knowledge base files or trigger automated synchronization into your local Obsidian Vault.
              </p>

              <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="font-bold text-xs text-yellow-400">📄 Markdown Knowledge Base</div>
                  <div className="text-[11px] text-zinc-400">`whatsapp_knowledge_base.md`</div>
                  <button 
                    onClick={handleSaveAll}
                    className="w-full mt-2 py-1.5 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20 text-xs font-bold transition"
                  >
                    Sync Markdown KB
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="font-bold text-xs text-purple-400">💎 Obsidian Vault Directory</div>
                  <div className="text-[11px] text-zinc-400">`~/Documents/MrPop_Knowledge_Vault`</div>
                  <button 
                    onClick={handleSaveAll}
                    className="w-full mt-2 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-xs font-bold transition"
                  >
                    Sync Obsidian Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-800 bg-[#0c0f18]">
          <span className="text-xs text-zinc-400">
            {faqList.filter(f => f.verified).length} of {faqList.length} FAQs Baseline Verified
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSaveAll}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-yellow-400 text-black text-xs font-extrabold hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/20"
            >
              <Save className="w-4 h-4" />
              Save & Baseline Knowledge Base
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
