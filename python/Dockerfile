FROM python:3.13-slim

WORKDIR /app

# Copia y descarga recursos antes de copiar todo
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

ENV NLTK_DATA=/usr/local/nltk_data

COPY . .

EXPOSE 3002
CMD ["python", "main.py"]
