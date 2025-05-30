
import unicodedata
import re

def normalize_text(text):
    # Elimina acentos y normaliza
    nfkd_form = unicodedata.normalize('NFKD', text)
    return "".join([c for c in nfkd_form if not unicodedata.combining(c)])

def extract_keywords(tokens, keywords_from_db):
    keyword_dict = {}

    # Creamos el diccionario de keywords: symptom → triageLevel (entero)
    for kw in keywords_from_db:
        if 'symptom' in kw and 'triageLevel' in kw:
            try:
                normalized_kw = normalize_text(kw['symptom'].lower())
                keyword_dict[normalized_kw] = int(kw['triageLevel'])
            except (ValueError, TypeError):
                print(f"Advertencia: triageLevel no numérico en symptom {kw['symptom']}")

    found_keywords = []

    normalized_text = normalize_text(" ".join(tokens).lower())
    normalized_tokens = [normalize_text(token.lower()) for token in tokens]

    for keyword, level in keyword_dict.items():
        if ' ' in keyword:
            # Coincidencia exacta de frase completa
            pattern = r'\b' + re.escape(keyword) + r'\b'
            if re.search(pattern, normalized_text):
                found_keywords.append({"symptom": keyword, "triageLevel": level})
        else:
            # Coincidencia exacta por token
            if keyword in normalized_tokens:
                found_keywords.append({"symptom": keyword, "triageLevel": level})

    triage_level = min((kw["triageLevel"] for kw in found_keywords), default=6)

    return {
        "found_keywords": found_keywords,
        "triage_level": triage_level
    }
