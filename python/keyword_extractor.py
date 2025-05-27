from tokenizer import generate_ngrams

def extract_keywords(tokens, keywords_from_db):
    found_keywords = set()
    current_min_level = float('inf')

    keyword_dict = {kw['symptom'].lower(): kw['triageLevel'] for kw in keywords_from_db}
    max_keyword_length = max(len(kw.split()) for kw in keyword_dict.keys())

    for n in range(1, max_keyword_length + 1):
        ngram_list = generate_ngrams(tokens, n)
        for ngram in ngram_list:
            if ngram in keyword_dict:
                found_keywords.add(ngram)
                kw_level = keyword_dict[ngram]
                if kw_level < current_min_level:
                    current_min_level = kw_level

    if current_min_level == float('inf'):
        current_min_level = None

    return {
        "found_keywords": list(found_keywords),
        "min_level": current_min_level
    }
