import nltk
#from nltk.tokenize import word_tokenize
from nltk.tokenize import RegexpTokenizer

def tokenize_text(text):
    tokenizer = RegexpTokenizer(r'\w+')
    tokens = tokenizer.tokenize(text.lower())  # Convertir a minúsculas y tokenizar
    return tokens