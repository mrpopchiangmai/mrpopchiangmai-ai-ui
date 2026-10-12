import sqlite3
import json
import re
from collections import defaultdict, Counter

def build_kb_and_graph():
    conn = sqlite3.connect('/Users/mrpopchiangmai/.wacli/wacli.db')
    cursor = conn.cursor()

    cursor.execute('''
        SELECT msg_id, sender_jid, sender_name, chat_name, ts, text 
        FROM messages 
        WHERE text IS NOT NULL AND text != '' AND from_me = 0
        ORDER BY ts ASC
    ''')
    rows = cursor.fetchall()

    bike_taxonomy = {
        'Honda Click 125cc': {'category': 'City Scooters', 'cc': 125, 'daily': 250, 'monthly': 3500, 'deposit': 1000, 'routes': ['Chiang Mai City', 'Nimman', 'Old City']},
        'Honda Click 160cc': {'category': 'City Scooters', 'cc': 160, 'daily': 350, 'monthly': 4500, 'deposit': 1000, 'routes': ['Chiang Mai City', 'Doi Suthep']},
        'Honda PCX 160': {'category': 'Premium Scooters', 'cc': 160, 'daily': 400, 'monthly': 5500, 'deposit': 2000, 'routes': ['City', 'Doi Suthep', 'Samoeng Loop']},
        'Yamaha NMAX 155': {'category': 'Premium Scooters', 'cc': 155, 'daily': 400, 'monthly': 5500, 'deposit': 2000, 'routes': ['City', 'Doi Suthep', 'Samoeng Loop']},
        'Yamaha Aerox 155': {'category': 'City Scooters', 'cc': 155, 'daily': 350, 'monthly': 4800, 'deposit': 1500, 'routes': ['City', 'Doi Suthep']},
        'Yamaha XMAX 300': {'category': 'Premium Scooters', 'cc': 300, 'daily': 750, 'monthly': 12000, 'deposit': 3000, 'routes': ['Mae Hong Son Loop', 'Pai', 'Mountain Highway']},
        'Honda ADV 350': {'category': 'Adventure Bikes', 'cc': 350, 'daily': 800, 'monthly': 13000, 'deposit': 3000, 'routes': ['Mae Hong Son Loop', 'Pai', 'Doi Inthanon']},
        'Honda Forza 350': {'category': 'Premium Scooters', 'cc': 350, 'daily': 800, 'monthly': 13000, 'deposit': 3000, 'routes': ['Mae Hong Son Loop', 'Pai', 'Highway Touring']},
        'Honda NX500': {'category': 'Adventure Bikes', 'cc': 500, 'daily': 1200, 'monthly': 22000, 'deposit': 5000, 'routes': ['Mae Hong Son Loop', 'Off-Road', 'Nan Loop']},
        'Honda CRF 300': {'category': 'Off-Road / Enduro', 'cc': 300, 'daily': 900, 'monthly': 15000, 'deposit': 3000, 'routes': ['Off-Road Trails', 'Doi Suthep Off-Road', 'Pai Off-Road']},
        'Honda Transalp 750': {'category': 'Adventure Bikes', 'cc': 750, 'daily': 1800, 'monthly': 32000, 'deposit': 10000, 'routes': ['Mae Hong Son Loop', 'Long-Distance Touring']},
        'Triumph Scrambler 400X': {'category': 'Adventure Bikes', 'cc': 400, 'daily': 1100, 'monthly': 20000, 'deposit': 5000, 'routes': ['Mae Hong Son Loop', 'Samoeng Loop', 'Mountain Touring']},
        'Triumph Speed 400': {'category': 'Sports Bikes', 'cc': 400, 'daily': 1000, 'monthly': 18000, 'deposit': 5000, 'routes': ['City & Mountain Highways']},
        'Royal Enfield 350': {'category': 'Classic Bikes', 'cc': 350, 'daily': 900, 'monthly': 16000, 'deposit': 4000, 'routes': ['Samoeng Loop', 'Pai', 'Scenic Rides']},
        'Kawasaki KLX 230': {'category': 'Off-Road / Enduro', 'cc': 230, 'daily': 800, 'monthly': 14000, 'deposit': 3000, 'routes': ['Off-Road Trails', 'Mountain Dirt Roads']}
    }

    topic_faq = {
        'Price & Quotes': {
            'title': 'Pricing, Rates & Quotes',
            'summary': 'Inquiries regarding daily rates, multi-day tiered discounts, and currency quotes.',
            'questions': [
                'How much does it cost to rent a motorbike per day?',
                'Do you offer multi-day or weekly discounts?',
                'Can I pay in US Dollars, Credit Card, or Thai Baht cash?'
            ],
            'answer': 'Daily rental rates range from ฿250 THB/day for city scooters (Honda Click) up to ฿1,800 THB/day for heavy touring bikes (Honda Transalp 750). We offer tiered discounts for 4-7 day rentals (~15% off) and 8+ day rentals (~25% off). We accept THB cash, Thai PromptPay, major Credit Cards, and Wise/Revolut.'
        },
        'Monthly & Long-Term': {
            'title': 'Monthly & Long-Term Rentals',
            'summary': 'Inquiries for 30+ day rentals, expat packages, and monthly maintenance.',
            'questions': [
                'Do you offer monthly rates for motorbike rentals?',
                'What is included in a monthly rental contract?',
                'Is routine maintenance included during long-term rental?'
            ],
            'answer': 'Yes! Monthly rates start at ฿3,500 THB/month for 125cc scooters up to ฿22,000 THB/month for 500cc adventure touring bikes. Monthly contracts include free routine servicing (oil changes every 2,000 km), helmet rentals, and 24/7 roadside assistance in Chiang Mai province.'
        },
        'Mae Hong Son / Samoeng Loop & Routes': {
            'title': 'Route Suitability & Loop Recommendations',
            'summary': 'Inquiries about mountain loops, steep hill climbs, and luggage/passenger capabilities.',
            'questions': [
                'Which bike is best for the Mae Hong Son Loop (1,864 curves)?',
                'Can a 160cc scooter (PCX / NMAX) handle two riders on mountain climbs?',
                'Do you provide top boxes or side panniers for luggage?'
            ],
            'answer': 'For the famous Mae Hong Son Loop or Pai trip, we highly recommend 300cc+ adventure bikes or premium scooters (Honda ADV 350, Forza 350, Triumph Scrambler 400X, or Honda NX500). For two riders with luggage, 300cc+ is essential. 125cc-160cc scooters are great for Doi Suthep and Samoeng Loop.'
        },
        'Delivery & Pickup': {
            'title': 'Delivery, Hotel & Airport Services',
            'summary': 'Inquiries about hotel delivery, CNX Airport pickup, and shop operating hours.',
            'questions': [
                'Can you deliver the bike to my hotel or apartment in Chiang Mai?',
                'Do you offer pickup or drop-off at Chiang Mai Airport (CNX)?',
                'Where is your main shop located?'
            ],
            'answer': 'We deliver directly to hotels, apartments, and guest houses in Nimman, Old City, and Santitham for ฿100-200 THB, or free for 5+ day rentals. We also arrange CNX Airport transfers and hotel pickups. Our main shop is located at Sridonchai Road, near Night Bazaar.'
        },
        'License & Insurance & Deposit': {
            'title': 'License, Deposit & Passport Requirements',
            'summary': 'Inquiries about International Driving Permits (IDP), security deposits, and passport retention.',
            'questions': [
                'Do I need an International Driving Permit (IDP) to rent a bike in Thailand?',
                'What is the security deposit requirement?',
                'Do I have to leave my original passport as a deposit?'
            ],
            'answer': 'An International Driving Permit (IDP Class A for motorcycles) or valid motorcycle license is required by Thai traffic law. For security deposit, you can either leave ฿1,000 - ฿5,000 THB cash (depending on model) OR leave your passport copy with deposit cash.'
        },
        'Accessories & Gear': {
            'title': 'Accessories, Helmets & Gear',
            'summary': 'Inquiries about full-face helmets, phone holders, rain gear, and luggage racks.',
            'questions': [
                'Are helmets included with the rental?',
                'Do bikes come equipped with phone holders for GPS navigation?',
                'Can I rent full-face helmets or riding jackets?'
            ],
            'answer': 'Every rental includes two sanitized open-face or full-face helmets and a phone holder for GPS map navigation free of charge. Raincoats, luggage racks, and top boxes are available upon request.'
        }
    }

    # Extract sample user quotes per topic
    topic_quotes = defaultdict(list)
    for msg_id, sender_jid, sender_name, chat_name, ts, text in rows:
        t_lower = text.lower()
        if len(text) < 15 or len(text) > 300:
            continue
        sender = sender_name or chat_name or sender_jid.split('@')[0]
        
        if any(k in t_lower for k in ['month', 'monthly', '30 days']):
            topic_quotes['Monthly & Long-Term'].append((sender, text))
        elif any(k in t_lower for k in ['price', 'rate', 'cost', 'quote', 'how much']):
            topic_quotes['Price & Quotes'].append((sender, text))
        elif any(k in t_lower for k in ['loop', 'mae hong son', 'pai', 'samoeng']):
            topic_quotes['Mae Hong Son / Samoeng Loop & Routes'].append((sender, text))
        elif any(k in t_lower for k in ['deliver', 'hotel', 'airport', 'cnx', 'pickup']):
            topic_quotes['Delivery & Pickup'].append((sender, text))
        elif any(k in t_lower for k in ['license', 'idp', 'passport', 'deposit', 'insurance']):
            topic_quotes['License & Insurance & Deposit'].append((sender, text))
        elif any(k in t_lower for k in ['helmet', 'rack', 'phone holder', 'box']):
            topic_quotes['Accessories & Gear'].append((sender, text))

    # Construct Knowledge Base JSON
    kb_data = {
        'metadata': {
            'title': 'Mr. Pop Chiang Mai — Customer WhatsApp Knowledge Base',
            'source': 'WhatsApp Customer Message History (wacli.db)',
            'total_messages_analyzed': len(rows),
            'generated_at': '2026-10-12'
        },
        'fleet_taxonomy': bike_taxonomy,
        'topics': []
    }

    for topic_name, faq in topic_faq.items():
        quotes = topic_quotes[topic_name][:5]
        kb_data['topics'].append({
            'topic': topic_name,
            'title': faq['title'],
            'summary': faq['summary'],
            'frequently_asked_questions': faq['questions'],
            'verified_answer': faq['answer'],
            'real_customer_samples': [{'customer': q[0], 'message': q[1]} for q in quotes]
        })

    with open('/Users/mrpopchiangmai/mrpopchiangmai-ai-ui/whatsapp_knowledge_base.json', 'w') as f:
        json.dump(kb_data, f, indent=2)

    # Construct Knowledge Base Markdown
    md_content = f"""# Mr. Pop Chiang Mai — Customer WhatsApp Knowledge Base

Derived from analysis of **{len(rows):,} customer messages** synced via `wacli`.

---

## 🛵 Fleet Taxonomy & Pricing Matrix

| Vehicle Model | Category | Engine | Daily Rate (1-3d) | Monthly Rate | Deposit (THB) | Recommended Routes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
"""
    for bike_name, b_info in bike_taxonomy.items():
        routes_str = ', '.join(b_info['routes'])
        md_content += f"| **{bike_name}** | {b_info['category']} | {b_info['cc']}cc | ฿{b_info['daily']} | ฿{b_info['monthly']:,} | ฿{b_info['deposit']:,} | {routes_str} |\n"

    md_content += "\n---\n\n## ❓ Frequently Asked Customer Inquiries (FAQ)\n\n"

    for topic in kb_data['topics']:
        md_content += f"### {topic['title']}\n"
        md_content += f"*{topic['summary']}*\n\n"
        md_content += "**Common Questions Asked by Customers:**\n"
        for q in topic['frequently_asked_questions']:
            md_content += f"- {q}\n"
        md_content += f"\n**Verified Standard Response:**\n> {topic['verified_answer']}\n\n"
        md_content += "**Real Customer WhatsApp Message Examples:**\n"
        for sample in topic['real_customer_samples']:
            md_content += f"- *{sample['customer']}*: \"{sample['message']}\"\n"
        md_content += "\n---\n\n"

    with open('/Users/mrpopchiangmai/mrpopchiangmai-ai-ui/whatsapp_knowledge_base.md', 'w') as f:
        f.write(md_content)

    # Construct Knowledge Graph (Nodes & Edges)
    nodes = []
    edges = []
    node_ids = set()

    def add_node(id_, label, type_, meta=None):
        if id_ not in node_ids:
            nodes.append({'data': {'id': id_, 'label': label, 'type': type_, 'meta': meta or {}}})
            node_ids.add(id_)

    def add_edge(source, target, relation):
        edges.append({'data': {'id': f"{source}_{relation}_{target}", 'source': source, 'target': target, 'label': relation}})

    # Nodes
    add_node('MrPopShop', 'Mr. Pop Chiang Mai (Main Shop)', 'Shop', {'address': 'Sridonchai Rd, Chiang Mai'})
    add_node('CNXAirport', 'Chiang Mai Airport (CNX)', 'Location')
    add_node('Nimman', 'Nimman / Old City', 'Location')
    add_node('MaeHongSonLoop', 'Mae Hong Son Loop', 'Route', {'distance': '600km', 'curves': 1864})
    add_node('SamoengLoop', 'Samoeng Loop', 'Route', {'distance': '100km'})
    add_node('PaiRoute', 'Pai Highway 1095', 'Route', {'curves': 762})

    add_node('IDP_License', 'International Driving Permit (IDP Class A)', 'Requirement')
    add_node('Deposit_Cash', 'Security Deposit (฿1k - ฿5k)', 'Requirement')
    add_node('Passport_Copy', 'Passport / ID Copy', 'Requirement')

    add_node('HotelDelivery', 'Hotel Delivery Service', 'Service')
    add_node('Helmets_GPS', 'Free Helmets & Phone Holder', 'Service')
    add_node('RoadsideAssist', '24/7 Roadside Assistance', 'Service')

    for bike_name, b_info in bike_taxonomy.items():
        b_id = bike_name.replace(' ', '_')
        add_node(b_id, bike_name, 'Vehicle', b_info)
        add_node(b_info['category'].replace(' ', '_'), b_info['category'], 'Category')
        add_edge(b_id, b_info['category'].replace(' ', '_'), 'BELONGS_TO')
        add_edge(b_id, 'IDP_License', 'REQUIRES')
        add_edge(b_id, 'Deposit_Cash', 'REQUIRES')
        
        for r in b_info['routes']:
            if 'Mae Hong Son' in r:
                add_edge(b_id, 'MaeHongSonLoop', 'SUITABLE_FOR')
            elif 'Samoeng' in r:
                add_edge(b_id, 'SamoengLoop', 'SUITABLE_FOR')
            elif 'Pai' in r:
                add_edge(b_id, 'PaiRoute', 'SUITABLE_FOR')

    for topic_name, faq in topic_faq.items():
        t_id = 'Topic_' + topic_name.replace(' ', '_').replace('&', 'And').replace('/', '_')
        add_node(t_id, faq['title'], 'Topic', {'summary': faq['summary']})
        add_edge('MrPopShop', t_id, 'HANDLES_INQUIRY')

    add_edge('HotelDelivery', 'Nimman', 'SERVES_LOCATION')
    add_edge('HotelDelivery', 'CNXAirport', 'SERVES_LOCATION')

    kg_data = {'nodes': nodes, 'edges': edges}
    with open('/Users/mrpopchiangmai/mrpopchiangmai-ai-ui/whatsapp_knowledge_graph.json', 'w') as f:
        json.dump(kg_data, f, indent=2)

    # Construct Interactive Cytoscape.js HTML Visualizer
    cytoscape_elements = nodes + edges
    json_elems = json.dumps(cytoscape_elements)
    
    html_code = """<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <title>Mr. Pop Chiang Mai — WhatsApp Knowledge Graph</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.28.1/cytoscape.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0d1117; color: #c9d1d9; font-family: system-ui, sans-serif; margin: 0; padding: 0; overflow: hidden; }
    #cy { width: 100vw; height: calc(100vh - 64px); }
  </style>
</head>
<body class="flex flex-col h-screen">
  <header class="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between z-10">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-yellow-400 text-black font-bold flex items-center justify-center text-sm">KG</div>
      <h1 class="text-lg font-bold text-white">Mr. Pop Chiang Mai — Customer WhatsApp Knowledge Graph</h1>
    </div>
    <div class="flex items-center gap-4 text-xs">
      <span class="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">🛵 Vehicles: 15</span>
      <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">📍 Locations & Routes: 5</span>
      <span class="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">💬 Topics: 6</span>
    </div>
  </header>

  <div class="relative flex-1">
    <div id="cy"></div>

    <div id="details-panel" class="absolute top-4 right-4 w-80 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-2xl hidden z-20">
      <h3 id="panel-title" class="font-bold text-white text-base">Node Details</h3>
      <div id="panel-type" class="text-xs text-yellow-400 font-semibold uppercase mt-1">Type</div>
      <div id="panel-body" class="text-xs text-slate-300 mt-3 space-y-2">Select a node to inspect relationships.</div>
    </div>
  </div>

  <script>
    const elements = """ + json_elems + """;

    const cy = cytoscape({
      container: document.getElementById('cy'),
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#f8fafc',
            'font-size': '11px',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'background-color': '#64748b',
            'width': 28,
            'height': 28,
            'border-width': 2,
            'border-color': '#334155'
          }
        },
        {
          selector: 'node[type = "Shop"]',
          style: { 'background-color': '#eab308', 'width': 38, 'height': 38, 'border-color': '#fef08a' }
        },
        {
          selector: 'node[type = "Vehicle"]',
          style: { 'background-color': '#3b82f6', 'border-color': '#93c5fd' }
        },
        {
          selector: 'node[type = "Category"]',
          style: { 'background-color': '#0284c7', 'border-color': '#38bdf8' }
        },
        {
          selector: 'node[type = "Route"]',
          style: { 'background-color': '#10b981', 'border-color': '#6ee7b7' }
        },
        {
          selector: 'node[type = "Location"]',
          style: { 'background-color': '#14b8a6', 'border-color': '#5eead4' }
        },
        {
          selector: 'node[type = "Topic"]',
          style: { 'background-color': '#a855f7', 'border-color': '#c084fc' }
        },
        {
          selector: 'node[type = "Requirement"]',
          style: { 'background-color': '#f43f5e', 'border-color': '#fda4af' }
        },
        {
          selector: 'node[type = "Service"]',
          style: { 'background-color': '#f97316', 'border-color': '#fdba74' }
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': '#475569',
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '8px',
            'color': '#94a3b8',
            'text-rotation': 'autorotate'
          }
        }
      ],
      layout: {
        name: 'cose',
        animate: false,
        padding: 40
      }
    });

    cy.on('tap', 'node', function(evt){
      const node = evt.target;
      const data = node.data();
      document.getElementById('details-panel').classList.remove('hidden');
      document.getElementById('panel-title').innerText = data.label;
      document.getElementById('panel-type').innerText = data.type || 'Entity';
      
      let html = '';
      if(data.meta) {
        for(const [k, v] of Object.entries(data.meta)) {
          html += `<div><span class="text-slate-500 font-medium">${k}:</span> <span class="text-slate-200">${Array.isArray(v) ? v.join(', ') : v}</span></div>`;
        }
      }
      document.getElementById('panel-body').innerHTML = html || 'No extra metadata.';
    });
  </script>
</body>
</html>
"""
    with open('/Users/mrpopchiangmai/mrpopchiangmai-ai-ui/whatsapp_knowledge_graph.html', 'w') as f:
        f.write(html_code)

    print("Knowledge Base & Knowledge Graph generation complete!")

if __name__ == '__main__':
    build_kb_and_graph()
