from db import get_keywords_from_db
from tokenizer import tokenize_text
from keyword_extractor import extract_keywords
import nltk
nltk.download('punkt')

def process_input_text(input_text):
    keywords_from_db = get_keywords_from_db()
    print(keywords_from_db)
    tokens = tokenize_text(input_text)
    print(tokens)
    result = extract_keywords(tokens, keywords_from_db)
    print(result)
    return result

if __name__ == "__main__":
    input_text = "Tengo un fuerte dolor de cabeza y algo de fiebre"
    result = process_input_text(input_text)
    print("Palabras encontradas:", result['found_keywords'])
    print("Nivel mínimo encontrado:", result['min_level'])
