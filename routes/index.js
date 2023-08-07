const express = require('express')
const router = express.Router()
const controller = require('../controllers/movies');
const { signup, login, logout } = require('../controllers/auth');
const {isAuthenticated} = require('../middleware/auth');

router.get('/', controller.getHomePage);
router.get('/search', controller.getAllMovies); 
router.get('/news', controller.getNews); 
router.get('/newsdetails', controller.getNewsDetails); 
router.get('/movies', controller.getAllMovies);
router.get('/movies/:movieId',controller.getSingleMovie);
router.get('/profile',isAuthenticated ,controller.getProfilePage);
router.post('/signup', signup);
router.post('/login', login);
router.post('/movies/:id/rate',isAuthenticated ,controller.submitUserRating);
router.get('/logout', logout)

module.exports = router;