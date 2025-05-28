
import unicodedata

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
    current_min_level = float('inf')  # Mantengo infinito aquí para comparar correctamente

    normalized_text = normalize_text(" ".join(tokens).lower())
    normalized_tokens = [normalize_text(token.lower()) for token in tokens]

    for keyword, kw_level in keyword_dict.items():
        if ' ' in keyword:
            # Si es multi-palabra, buscar en el texto completo
            if keyword in normalized_text:
                found_keywords.append(keyword)
                if kw_level < current_min_level:
                    current_min_level = kw_level
        else:
            # Si es palabra simple, buscar token por token
            if keyword in normalized_tokens:
                found_keywords.append(keyword)
            if kw_level < current_min_level:
                current_min_level = kw_level

    return {
        "found_keywords": found_keywords,
        "triage_level": current_min_level if current_min_level != float('inf') else None
    }
