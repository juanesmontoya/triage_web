import nltk
from nltk.tokenize import word_tokenize
from nltk.util import ngrams

nltk.download('punkt')
nltk.download('punkt_tab')

def tokenize_text(text):
    tokens = word_tokenize(text.lower())
    return tokens

def generate_ngrams(tokens, n):
    return [' '.join(gram) for gram in ngrams(tokens, n)]
