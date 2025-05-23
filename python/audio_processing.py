import speech_recognition as sr
from pymongo import MongoClient

def process_audio(audio_file):
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_file) as source:
        audio = recognizer.record(source)
    text = recognizer.recognize_google(audio, language='es-CO')
    
    # Conectar a MongoDB y obtener síntomas y niveles de triage
    #client = MongoClient('mongodb+srv://juanesmontoya92:tdea@electiva2.zd1g5.mongodb.net')
    #db = client['triageDb']
    #sintomas_collection = db['Symptom']
    #sintomas_data = list(sintomas_collection.find({}))
    
    # Extraer síntomas del texto
    sintomas_detectados = []
    nivel_triage = 6
    for item in sintomas_data:
        if item['symptom'] in text.lower():
            sintomas_detectados.append(item['nombre'])
            if item['triageLevel'] < nivel_triage:
                nivel_triage = item['triageLevel']
    
    return {
        'Consulta': text,
        'sintomas': sintomas_detectados,
        'nivel_triage': nivel_triage
    }
