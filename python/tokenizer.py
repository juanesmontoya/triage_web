import nltk
from nltk.tokenize import word_tokenize

def tokenize_text(text):
    tokens = word_tokenize(text)
    # Normalizar tokens a minúsculas
    tokens = [token.lower() for token in tokens]
    return tokens