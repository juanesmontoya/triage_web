from flask import Flask, request, jsonify
from db import get_keywords_from_db
from tokenizer import tokenize_text
from keyword_extractor import extract_keywords
import traceback

app = Flask(__name__)

@app.route('/processData', methods=['POST'])
def process_data():
    try:
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

    except Exception as e:
        return jsonify({
            'error': str(e),
            'trace': traceback.format_exc()
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3002)