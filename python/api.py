from flask import Flask, request, jsonify
from db import get_keywords_from_db
from tokenizer import tokenize_text
from keyword_extractor import extract_keywords

app = Flask(__name__)

@app.route('/process', methods=['POST'])
def process_text():
    data = request.get_json()
    input_text = data.get('text', '')

    if not input_text:
        return jsonify({'error': 'No text provided'}), 400

    keywords_from_db = get_keywords_from_db()
    tokens = tokenize_text(input_text)
    result = extract_keywords(tokens, keywords_from_db)

    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3002)
