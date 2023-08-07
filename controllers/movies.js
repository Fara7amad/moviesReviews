const { movieRecommendations, getMovieRecommendations } = require('../helpers/API');
const {isLoggedIn} = require('../middleware/auth');
const movie = require('../models/movie');
const user = require('../models/user');
const genreColors = require('../public/js/genreColors');
const PAGE_SIZE = 30;

/**
 * Controller function to retrieve a list of movies based on query parameters.
 *
 * @param {Object} req - The request object containing query parameters.
 * @param {Object} res - The response object for sending data to the client.
 * @returns {Promise<void>} - A promise that resolves after processing the request.
 */
const getAllMovies = async (req, res) => {
  // Check if user is logged in
  const isLogged = isLoggedIn(req);

  try {
    // Extract query parameters
    const { page = 1, query } = req.query;

    let totalRecords;
    let movies;
    let queryOptions = {};

    // Build query options for searching based on 'query' parameter
    if (query) {
      const searchRegex = new RegExp(query, 'i');
      queryOptions = {
        $or: [
          { title: { $regex: searchRegex } },
          { genres: { $regex: searchRegex } },
          { keywords: { $regex: searchRegex } },
        ],
      };
    }

    // Count total records based on query options
    totalRecords = await movie.countDocuments(queryOptions);
    const totalPages = Math.ceil(totalRecords / PAGE_SIZE);
    const skip = (page - 1) * PAGE_SIZE;

    // Retrieve movies based on query and pagination
    if (query) {
      movies = await movie.find(queryOptions).skip(skip).limit(PAGE_SIZE);
    } else {
      movies = await movie.find().skip(skip).limit(PAGE_SIZE);
    }

    // Render the 'movies' page with retrieved data
    res.render('pages/movies', {
      isLoggedIn: isLogged,
      total: totalRecords,
      data: movies,
      currentPage: page,
      totalPages: totalPages,
      query: query,
    });
  } catch (err) {
    // Handle errors by sending an Internal Server Error response
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


/**
 * Controller function to retrieve a list of the most popular movies.
 *
 * @param {Object} req - The request object (not used in this function).
 * @param {Object} res - The response object for sending data to the client.
 * @returns {Promise<Array>} - A promise that resolves with an array of most popular movies.
 */
const getMostPopularMovies = async (req, res) => {
  try {
    // Retrieve a list of movies sorted by popularity in descending order, limited to 10 results
    const popular = await movie.find()
      .sort({ popularity: -1 })
      .limit(10);

    // Return the array of most popular movies
    return popular;
  } catch (err) {
    // Handle errors by sending an Internal Server Error response
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

  /**
 * Controller function to retrieve a list of the highest rated movies.
 *
 * @param {Object} req - The request object (not used in this function).
 * @param {Object} res - The response object for sending data to the client.
 * @returns {Promise<Array>} - A promise that resolves with an array of highest rated movies.
 */
const getHighestRatedMovies = async (req, res) => {
  try {
    // Retrieve a list of movies sorted by rating in descending order, limited to 10 results
    const highestRated = await movie.find()
      .sort({ rating: -1 })
      .limit(10);

    // Return the array of highest rated movies
    return highestRated;
  } catch (err) {
    // Handle errors by sending an Internal Server Error response
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

 /**
 * Controller function to retrieve a list of upcoming movies (coming soon).
 *
 * @param {Object} req - The request object (not used in this function).
 * @param {Object} res - The response object for sending data to the client.
 * @returns {Promise<Array>} - A promise that resolves with an array of upcoming movies.
 */
const getComingSoonMovies = async (req, res) => {
  try {
    // Retrieve a list of movies with release dates greater than or equal to the current date,
    // sorted by release date in ascending order, and limited to 10 results
    const comingSoon = await movie.find({ release_date: { $gte: new Date() } })
      .sort({ release_date: 1 })
      .limit(10);

    // Return the array of upcoming movies (coming soon)
    return comingSoon;
  } catch (err) {
    // Handle errors by sending an Internal Server Error response
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

 /**
 * Controller function to retrieve a list of the newest movies based on release date.
 *
 * @param {Object} req - The request object (not used in this function).
 * @param {Object} res - The response object for sending data to the client.
 * @returns {Promise<Array>} - A promise that resolves with an array of newest movies.
 */
const getNewestMovies = async (req, res) => {
  try {
    // Aggregate pipeline to retrieve and process the newest movies
    const newestMovies = await movie.aggregate([
      {
        $addFields: {
          release_date_parsed: {
            $dateFromString: {
              dateString: '$release_date',
              format: '%m/%d/%Y',
            },
          },
        },
      },
      {
        $sort: {
          release_date_parsed: -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          release_date_parsed: 0, // Exclude the parsed date if you don't want it in the final result
        },
      },
    ]);

    // Return the array of newest movies
    return newestMovies;
  } catch (err) {
    // Handle errors if needed (not enabled in the provided code)
    // res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Controller function to render the home page with movie recommendations and various movie lists.
 *
 * @param {Object} req - The request object for retrieving movie data and user session information.
 * @param {Object} res - The response object for rendering the home page.
 * @returns {Promise<void>} - A promise that resolves after processing and rendering the home page.
 */
const getHomePage = async (req, res) => {
  try {
    // Retrieve movie lists
    const newMovies = await getNewestMovies(req, res);
    const mostPopular = await getMostPopularMovies(req, res);
    const topRated = await getHighestRatedMovies(req, res);
    const comingSoon = await getComingSoonMovies(req, res);

    // Check user login status
    const isLogged = isLoggedIn(req);

    let recommendations = [];
    if (isLogged) {
      // Retrieve personalized movie recommendations for logged-in users
      recommendations = await getMovieRecommendations(req.session.userId);
    }

    // Retrieve movie details for recommended movies
    const movieDetails = await movie.find({ title: { $in: recommendations.map(movie => movie.title) } });

    // Render the home page with retrieved data
    res.render('pages/home', {
      newMovies: newMovies,
      mostPopular: mostPopular,
      topRated: topRated,
      comingSoon: comingSoon,
      genreColors: genreColors, 
      isLoggedIn: isLogged,
      recommendations: movieDetails,
    });
  } catch (error) {
    console.error('Error rendering home page:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Controller function to render the profile page.
 *
 * @param {Object} req - The request object to check the status of session.
 * @param {Object} res - The response object for rendering the profile page.
 * @returns {void} - This function does not return a value.
 */
const getProfilePage = async (req,res) => {
  const isLogged = isLoggedIn(req);
  user_id=req.session.userId;
  userObj= await user.findById(user_id);
  res.render('pages/profile', { isLoggedIn: isLogged, user: userObj });
};
/**
 * Retrieves the user's rating for a specific movie from their movie list.
 *
 * @param {Object} user - The user object containing the movie list.
 * @param {string} movieId - The ID of the movie to retrieve the rating for.
 * @returns {number} - The user's rating for the movie, or 0 if not found.
 */
const getUserRatingForMovie = (user, movieId) => {
  const movieEntry = user.movieList.find(item => item.movie_id.toString() === movieId.toString());
  return movieEntry ? movieEntry.rating : 0;
};

/**
 * Controller function to retrieve details for a single movie and display them on a page.
 *
 * @param {Object} req - The request object containing the movie ID parameter.
 * @param {Object} res - The response object for rendering the movie details page.
 * @returns {Promise<void>} - A promise that resolves after processing the request.
 */
const getSingleMovie = async (req, res) => {
  const movieId = parseInt(req.params.movieId);
  const isLogged = isLoggedIn(req);

  // Retrieve movie recommendations and related movie details
  const recommendations = await movieRecommendations(movieId);
  const recommendedTitles = recommendations.slice(1).map(movie => movie[0]);
  const moviesDetails = await movie.find({ title: { $in: recommendedTitles } });

  try {
    const movieObj = await movie.findOne({ id: movieId });

    if (!movieObj) {
      // Movie not found, render 404 page
      return res.render("pages/404");
    }

    if (req.session.userId) {
      // User is logged in, retrieve user and their movie rating
      const userId = req.session.userId;
      const userObj = await user.findById(userId);
      const userRating = getUserRatingForMovie(userObj, movieId);

      // Render movie details page with user's rating and related movie details
      res.render('pages/singleMovie', {
        isLoggedIn: isLogged,
        movie: movieObj,
        userRating: userRating,
        moviesDetails: moviesDetails,
        genreColors: genreColors,
      });
    } else {
      // User is not logged in, render movie details page with default rating and related movie details
      res.render('pages/singleMovie', {
        isLoggedIn: isLogged,
        movie: movieObj,
        userRating: 0,
        moviesDetails: moviesDetails,
        genreColors: genreColors,
      });
    }
  } catch (error) {
    // Handle errors by rendering 404 page
    console.error('Error fetching movie:', error);
    res.render('pages/404');
  }
};


  /**
 * Controller function to update the rating of a movie and save it to the user's movie list.
 *
 * @param {Object} req - The request object containing the movie ID parameter and rating in the request body.
 * @param {Object} res - The response object for sending status messages.
 * @returns {Promise<void>} - A promise that resolves after processing the request.
 */
const submitUserRating = async (req, res) => {
  const movieId = req.params.id;
  const { rating } = req.body;
  const userId = req.session.userId;

  try {
    // Find the movie by ID
    const movieObj = await movie.findOne({ id: movieId });

    if (!movieObj) {
      return res.status(404).json({ error: 'Movie not found.' });
    }

    // Update the movie's rating and vote count
    movieObj.vote_count += 1;
    movieObj.rating = ((movieObj.rating * (movieObj.vote_count - 1)) + parseInt(rating)) / movie.vote_count;

    // Save the updated movie
    await movie.findOneAndUpdate({ id: movieId }, { $set: movieObj });

    // Find the user by ID
    const userObj = await user.findById(userId);

    if (!userObj) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Save the movie information to the user's movie list
    userObj.movieList.push({
      movie_id: movieId,
      rating: parseInt(rating),
    });

    // Save the user object
    await userObj.save();

    // Return success message
    res.json({ message: 'Rating updated successfully.' });
  } catch (error) {
    // Handle errors by logging and sending an Internal Server Error response
    console.error('Error during rating:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Controller function to render the news/blog page.
 *
 * @param {Object} req - The request object (not used in this function).
 * @param {Object} res - The response object for rendering the news/blog page.
 * @returns {void} - This function does not return a value.
 */
const getNews = async (req, res) => {
  const isLogged = isLoggedIn(req);
  res.render('pages/blog', { isLoggedIn: isLogged });
};

/**
 * Controller function to render the details page for a specific news/blog item.
 *
 * @param {Object} req - The request object (not used in this function).
 * @param {Object} res - The response object for rendering the news/blog details page.
 * @returns {void} - This function does not return a value.
 */
const getNewsDetails = async (req, res) => {
  const isLogged = isLoggedIn(req);
  res.render('pages/blogdetail', { isLoggedIn: isLogged });
};

  
module.exports = { 
                    getAllMovies,
                    getMostPopularMovies,
                    getHighestRatedMovies,
                    getComingSoonMovies,
                    getHomePage,
                    getNewestMovies,
                    getSingleMovie,
                    submitUserRating,
                    getNews,
                    getNewsDetails,
                    getProfilePage };
 