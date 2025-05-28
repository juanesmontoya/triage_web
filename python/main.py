import sys
from db import get_keywords_from_db, update_triage
from tokenizer import tokenize_text
from keyword_extractor import extract_keywords
import json

if __name__ == '__main__':
    input_text = sys.argv[1]
    #triage_id = sys.argv[2]

    keywords_from_db = get_keywords_from_db()
    tokens = tokenize_text(input_text)
    result = extract_keywords(tokens, keywords_from_db)

    #update_triage(triage_id, result['found_keywords'], result['triage_level'])
    
    print(json.dumps({
    "found_keywords": result['found_keywords'],
    "triage_level": result['triage_level']
    }))