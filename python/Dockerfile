FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN apt-get update
RUN apt-get install libasound-dev libportaudio2 libportaudiocpp0 portaudio19-dev -y
RUN apt-get install gcc -y
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m nltk.downloader punkt punkt_tab
RUN echo "Python working on back-end"
COPY . .

EXPOSE 3002