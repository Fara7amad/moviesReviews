
const axios = require('axios');
/**
 * Retrieves movie recommendations based on a given movie ID.
 *
 * @param {string} id - The ID of the movie to generate recommendations for.
 * @returns {Promise<Array>} - A promise that resolves with an array of recommended movies.
 */
async function movieRecommendations(id) {
  try {
    const response = await axios.post('http://127.0.0.1:8000/recommendmovies', { id: id });
    return response.data.recommendations;
  } catch (error) {
    console.error('Error fetching movie recommendations:', error);
    return [];
  }
}

/**
 * Retrieves personalized movie recommendations for a given user ID.
 *
 * @param {string} userId - The ID of the user to generate personalized recommendations for.
 * @returns {Promise<Array>} - A promise that resolves with an array of personalized movie recommendations.
 */
async function getMovieRecommendations(userId) {
    try {
      const response = await axios.post('http://127.0.0.1:8000/recommend', { user_id: userId });
      return response.data.recommendations;
    } catch (error) {
      console.error('Error fetching movie recommendations:', error);
      return [];
    }
  }
  
module.exports={movieRecommendations, getMovieRecommendations}