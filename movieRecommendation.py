from bottle import Bottle
from bottle import route, run, request, response
import json
import pymongo
from pymongo import MongoClient
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from bson import ObjectId
from sklearn.neighbors import NearestNeighbors
from dotenv import load_dotenv
import os
load_dotenv()
mongodb_uri = os.getenv('MONGO_URI')
client_name=os.getenv('CLIENT')
# Connect to MongoDB
client = pymongo.MongoClient(mongodb_uri)
db = client[client_name]
users_collection = db['users']
movies_collection = db['movies']

##########################################################################################################################################
def load_user_data(user_id):
    user_id_obj = ObjectId(user_id)
    user = users_collection.find_one({'_id': user_id_obj})
    if user:
        return user.get('movieList', [])
    return []

def load_movie_data():
    return list(movies_collection.find())

def preprocess_movie_data(movie_data):
    movies_df = pd.DataFrame(movie_data)
    genres = movies_df['genres'].apply(lambda x: x.split('|')[:3])
    genres_str = genres.apply(lambda x: ' '.join(x))
    keywords_str = movies_df['keywords']
    overview_str = movies_df['overview']

    tfidf_vectorizer = TfidfVectorizer(stop_words='english')
    genres_tfidf = tfidf_vectorizer.fit_transform(genres_str)
    keywords_tfidf = tfidf_vectorizer.fit_transform(keywords_str)
    overview_tfidf = tfidf_vectorizer.fit_transform(overview_str)

    return genres_tfidf, keywords_tfidf, overview_tfidf


movie_data = load_movie_data()
genres_tfidf, keywords_tfidf, overview_tfidf = preprocess_movie_data(movie_data)

def calculate_similarity(user_movie_list, genres_tfidf, keywords_tfidf, overview_tfidf):
    user_movie_ids = [entry['movie_id'] for entry in user_movie_list]
    movie_ids = [movie['id'] for movie in movie_data]  

    user_movie_indices = [index for index, movie_id in enumerate(movie_ids) if movie_id in user_movie_ids]

    if not user_movie_indices:
        raise ValueError("No matching movie IDs found in the movie data.")

    genres_similarity = cosine_similarity(genres_tfidf[user_movie_indices], genres_tfidf)
    keywords_similarity = cosine_similarity(keywords_tfidf[user_movie_indices], keywords_tfidf)
    overview_similarity = cosine_similarity(overview_tfidf[user_movie_indices], overview_tfidf)

    total_similarity = (genres_similarity + keywords_similarity + overview_similarity) / 3
    return total_similarity

def recommend_movies(user_similarity, user_movie_list, movie_data, threshold=0.5, top_n=10):
    user_movie_ids = [entry['movie_id'] for entry in user_movie_list]
    user_movie_indices = [entry['movie_id'] for entry in user_movie_list]
    similar_movie_indices = np.argsort(user_similarity, axis=1)[:, ::-1]  

    recommended_movies = []
    for user_index, movie_indices in enumerate(similar_movie_indices):
        for movie_index in movie_indices:
            if user_movie_ids[user_index] != movie_data[movie_index]['id']:
                movie = movie_data[movie_index]
                if movie['rating'] > 5 and movie['vote_count'] > threshold:
                    recommended_movies.append({
                        'movie_id': movie['id'],
                        'title': movie['title'],
                        'similarity': user_similarity[user_index, movie_index]
                    })
                    if len(recommended_movies) == top_n:
                        return recommended_movies  
    return recommended_movies

@route('/recommend', method='OPTIONS')
def enable_cors():
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'

@route('/recommend', method='POST')
def get_recommendations():
    enable_cors()

    user_id = request.json.get('user_id')
    user_movie_list = load_user_data(user_id)
    user_similarity = calculate_similarity(user_movie_list, genres_tfidf, keywords_tfidf, overview_tfidf)
    threshold = 1000  
    top_n = 10  
    recommended_movies = recommend_movies(user_similarity, user_movie_list, movie_data, threshold, top_n)
    recommendations = [{'title': movie['title'], 'similarity': movie['similarity']} for movie in recommended_movies]
    response.content_type = 'application/json'
    return json.dumps({'recommendations': recommendations})


##################################################################################################################################################

# Load data from MongoDB into a DataFrame
data = list(movies_collection.find({}, {'_id': 0}))
df = pd.DataFrame(data)

# Preprocess genres by keeping only the first 3 genres
df['genres'] = df['genres'].apply(lambda x: '|'.join(x.split('|')[:3]))

# TF-IDF Vectorization
tfidf_vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf_vectorizer.fit_transform(df['keywords'] + ' ' + df['overview'] + ' ' + df['genres'])

# Create KNN model
knn_model = NearestNeighbors(n_neighbors=6, metric='cosine')
knn_model.fit(tfidf_matrix)

def get_movie_title(movie_id):
    movie_title = df[df['id'] == movie_id]['title'].values[0]
    return movie_title

def recommend(movie_title):
    # Find the movie index based on movie title
    movie_indices = df.index[df['title'].str.lower() == movie_title.lower()].tolist()
    if not movie_indices:
        print("Movie not found in the database.")
        return []

    movie_index = movie_indices[0]
    query_vector = tfidf_matrix[movie_index]

    # Find k-nearest neighbors
    distances, indices = knn_model.kneighbors(query_vector, n_neighbors=6)

    similar_movies = [(df.iloc[i]['title'], 1 - dist) for i, dist in zip(indices[0], distances[0])]

    return similar_movies

@route('/recommendmovies', method='OPTIONS')
def enable_cors_for_options():
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'

@route('/recommendmovies', method='POST')
def get_recommendations():
    enable_cors_for_options()

    movie_id = request.json.get('id')
    try:
        title = get_movie_title(movie_id)
        recommendations = recommend(title)
        response.content_type = 'application/json'
        return json.dumps({'recommendations': recommendations})
    except Exception as e:
        response.status = 500
        return str(e)
    
if __name__ == '__main__':
    run(host='localhost', port=8000)