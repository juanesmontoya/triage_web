from pymongo import MongoClient
import os

# Ensure the environment variable is set for MongoDB URI
MONGO_URI = os.getenv("MONGO_URI")

def get_mongo_client(uri=MONGO_URI):
    client = MongoClient(uri)
    return client

def get_keywords_from_db(db_name="triageDb", collection_name="sypmtoms"):
    client = get_mongo_client()
    db = client[db_name]
    collection = db[collection_name]
    keywords = list(collection.find({}, {"_id": 0, "symptom": 1, "triageLevel": 1, "description": 0}))
    client.close()
    return keywords
