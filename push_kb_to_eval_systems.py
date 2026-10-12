import os
import json
import sys

def load_kb_data():
    kb_path = '/Users/mrpopchiangmai/mrpopchiangmai-ai-ui/whatsapp_knowledge_base.json'
    with open(kb_path) as f:
        return json.load(f)

def build_eval_records(kb_data):
    records = []
    
    # 1. Topic FAQ Goldens
    for topic in kb_data.get('topics', []):
        cat = topic.get('topic')
        expected = topic.get('verified_answer')
        
        for q in topic.get('frequently_asked_questions', []):
            records.append({
                'input': q,
                'expected': expected,
                'metadata': {
                    'category': cat,
                    'type': 'FAQ_Question',
                    'source': 'WhatsApp Customer Analysis'
                }
            })
            
        for sample in topic.get('real_customer_samples', []):
            records.append({
                'input': sample['message'],
                'expected': expected,
                'metadata': {
                    'category': cat,
                    'type': 'Real_Customer_WhatsApp_Message',
                    'customer': sample['customer']
                }
            })
            
    # 2. Fleet Specifications Goldens
    fleet = kb_data.get('fleet_taxonomy', {})
    for bike_name, b_info in fleet.items():
        q = f"What is the daily rate, monthly rate, deposit, and engine size for {bike_name}?"
        exp = f"{bike_name} ({b_info['cc']}cc): Daily rate ฿{b_info['daily']} THB/day, Monthly rate ฿{b_info['monthly']:,} THB/month, Security Deposit ฿{b_info['deposit']:,} THB. Category: {b_info['category']}. Recommended routes: {', '.join(b_info['routes'])}."
        records.append({
            'input': q,
            'expected': exp,
            'metadata': {
                'category': 'Fleet_Specs',
                'bike_name': bike_name,
                'cc': b_info['cc'],
                'daily_thb': b_info['daily'],
                'type': 'Fleet_Specification'
            }
        })

    return records

def push_to_braintrust(records, project_name="MrPopChiangMai_Rental_KB"):
    api_key = os.getenv('BRAINTRUST_API_KEY')
    if not api_key:
        print("⚠️ BRAINTRUST_API_KEY environment variable is missing. Set it to push live to Braintrust.")
        print(f"Prepared {len(records)} goldens ready for Braintrust project '{project_name}'.")
        return False
        
    try:
        import braintrust
        print(f"Connecting to Braintrust (Project: {project_name})...")
        dataset = braintrust.init_dataset(
            project=project_name,
            dataset="WhatsApp_Customer_Inquiries_KB"
        )
        
        for r in records:
            dataset.insert(
                input=r['input'],
                expected=r['expected'],
                metadata=r['metadata']
            )
            
        dataset.flush()
        print(f"Successfully pushed {len(records)} evaluation records to Braintrust!")
        return True
    except Exception as e:
        print(f"❌ Error pushing to Braintrust: {e}")
        return False

def push_to_confident_ai(records, dataset_alias="MrPop_WhatsApp_KB"):
    api_key = os.getenv('CONFIDENT_AI_API_KEY') or os.getenv('DEEPEVAL_SECRET')
    if not api_key:
        print("⚠️ CONFIDENT_AI_API_KEY / DEEPEVAL_SECRET environment variable is missing. Set it to push live to Confident.ai.")
        print(f"Prepared {len(records)} Goldens ready for Confident.ai alias '{dataset_alias}'.")
        return False

    try:
        from deepeval.dataset import Golden, EvaluationDataset
        print(f"Connecting to Confident.ai (Dataset: {dataset_alias})...")
        
        goldens = []
        for r in records:
            goldens.append(Golden(
                input=r['input'],
                expected_output=r['expected'],
                retrieval_context=[r['expected']],
                additional_metadata=r['metadata']
            ))
            
        dataset = EvaluationDataset(goldens=goldens)
        dataset.push(alias=dataset_alias)
        print(f"Successfully pushed {len(records)} Goldens to Confident.ai!")
        return True
    except Exception as e:
        print(f"❌ Error pushing to Confident.ai: {e}")
        return False

if __name__ == '__main__':
    print("Parsing WhatsApp Knowledge Base data...")
    kb = load_kb_data()
    records = build_eval_records(kb)
    print(f"Extracted {len(records)} Evaluation Test Cases (Goldens) from Knowledge Base.")
    
    print("\n--- Braintrust Sync ---")
    push_to_braintrust(records)
    
    print("\n--- Confident.ai (DeepEval) Sync ---")
    push_to_confident_ai(records)
