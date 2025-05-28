from db import get_keywords_from_db
from tokenizer import tokenize_text
from keyword_extractor import extract_keywords

# Texto de prueba (puedes cambiarlo por cualquier otro)
input_text = "Tengo dolor de cabEza diaRréa y una tos severa desde ayer y fiebre. Dolor muScúlar"

# Obtener palabras clave desde la base de datos MongoDB
keywords_from_db = get_keywords_from_db()

# Tokenizar y normalizar el texto de entrada
tokens = tokenize_text(input_text)

# Procesar las palabras clave encontradas
result = extract_keywords(tokens, keywords_from_db)

# Imprimir resultados
print("=== Resultados ===")
print(f"Texto original: {input_text}")
print(f"Tokens: {tokens}")
print(keywords_from_db)
print(f"Palabras encontradas: {result['found_keywords']}")
print(f"Triage Level (nivel mínimo): {result['triage_level']}")

print("triage terminado")