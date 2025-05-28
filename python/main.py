import sys
from db import get_keywords_from_db, update_triage
from tokenizer import tokenize_text
from keyword_extractor import extract_keywords
import json
from flask import Flask, request, jsonify

app = Flask(__name__)
@app.route('/processData', methods=['POST'])
def process_data():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
    
    text = data.get('text', '')
    if not text:
        return jsonify({'error': 'Empty text provided'}), 400
    
    # Tokenizar el texto
    tokens = tokenize_text(text)

    # Obtener palabras clave de la base de datos
    keywords_from_db = get_keywords_from_db()
    
    # Extraer palabras clave
    result = extract_keywords(tokens, keywords_from_db)
    
    return jsonify(result), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3002)
    