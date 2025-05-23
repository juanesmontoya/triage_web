from flask import Flask, request, jsonify
from audio_processing import process_audio

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze():
    audio_file = request.files['audio']
    result = process_audio(audio_file)
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3002)
