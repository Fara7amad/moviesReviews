const mongoose = require('mongoose');
const User = require('../models/user');
const faker = require('faker'); 
require('dotenv').config()

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

// Function to generate a random movieList for a user
const generateMovieList = (numMovies, movieData) => {
  const movieList = [];
  for (let i = 0; i < numMovies; i++) {
    const randomIndex = Math.floor(Math.random() * movieData.length);
    const movie_id = movieData[randomIndex].movie_id;
    const rating = Math.floor(Math.random() * 10) + 1; 
    const liked = Math.random() < 0.5; 
    movieList.push({ movie_id, rating, liked });
  }
  return movieList;
};

// Function to generate dummy user data
const generateDummyUsers = async (numUsers, movieData) => {
  for (let i = 0; i < numUsers; i++) {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const username = faker.internet.userName();
    const email = faker.internet.email();
    const password = faker.internet.password();

    const movieList = generateMovieList(Math.floor(Math.random() * 10) + 1, movieData); 

    const newUser = new User({
      firstname: firstName,
      lastname: lastName,
      username: username,
      email: email,
      password: password,
      movieList: movieList,
    });

    await newUser.save();
  }
  console.log('Dummy users data has been generated and saved to the database.');
};

//100 random movies' id got extracted from the CSV
const movieData = [
    {'movie_id': '12143'},
    {'movie_id': '47559'},
    {'movie_id': '8467'},
    {'movie_id': '14577'},
    {'movie_id': '18890'},
    {'movie_id': '11955'},
    {'movie_id': '10673'},
    {'movie_id': '17198'},
    {'movie_id': '259072'},
    {'movie_id': '70588'},
    {'movie_id': '9373'},
    {'movie_id': '16564'},
    {'movie_id': '38073'},
    {'movie_id': '38580'},
    {'movie_id': '20777'},
    {'movie_id': '1440'},
    {'movie_id': '17494'},
    {'movie_id': '13764'},
    {'movie_id': '250480'},
    {'movie_id': '4199'},
    {'movie_id': '17529'},
    {'movie_id': '250124'},
    {'movie_id': '9707'},
    {'movie_id': '10412'},
    {'movie_id': '9754'},
    {'movie_id': '26180'},
    {'movie_id': '2752'},
    {'movie_id': '81716'},
    {'movie_id': '20294'},
    {'movie_id': '236028'},
    {'movie_id': '10661'},
    {'movie_id': '21467'},
    {'movie_id': '24032'},
    {'movie_id': '9353'},
    {'movie_id': '10191'},
    {'movie_id': '27172'},
    {'movie_id': '27022'},
    {'movie_id': '7183'},
    {'movie_id': '243683'},
    {'movie_id': '11448'},
    {'movie_id': '1273'},
    {'movie_id': '2153'},
    {'movie_id': '13636'},
    {'movie_id': '10658'},
    {'movie_id': '254188'},
    {'movie_id': '5968'},
    {'movie_id': '340247'},
    {'movie_id': '3638'},
    {'movie_id': '29478'},
    {'movie_id': '14805'},
    {'movie_id': '11507'},
    {'movie_id': '48150'},
    {'movie_id': '24126'},
    {'movie_id': '198185'},
    {'movie_id': '47763'},
    {'movie_id': '9366'},
    {'movie_id': '80035'},
    {'movie_id': '2155'},
    {'movie_id': '28891'},
    {'movie_id': '27568'},
    {'movie_id': '14681'},
    {'movie_id': '15674'},
    {'movie_id': '291189'},
    {'movie_id': '22317'},
    {'movie_id': '9980'},
    {'movie_id': '13851'},
    {'movie_id': '216282'},
    {'movie_id': '119569'},
    {'movie_id': '154'},
    {'movie_id': '18198'},
    {'movie_id': '15556'},
    {'movie_id': '4958'},
    {'movie_id': '178850'},
    {'movie_id': '956'},
    {'movie_id': '11586'},
    {'movie_id': '11135'},
    {'movie_id': '51994'},
    {'movie_id': '10261'},
    {'movie_id': '38745'},
    {'movie_id': '3121'},
    {'movie_id': '10562'},
    {'movie_id': '10364'},
    {'movie_id': '30432'},
    {'movie_id': '64686'},
    {'movie_id': '23190'},
    {'movie_id': '15026'},
    {'movie_id': '24615'},
    {'movie_id': '3116'},
    {'movie_id': '310131'},
    {'movie_id': '267793'},
    {'movie_id': '128216'},
    {'movie_id': '11624'},
    {'movie_id': '256766'},
    {'movie_id': '15789'},
    {'movie_id': '178'},
    {'movie_id': '218329'},
    {'movie_id': '102362'},
    {'movie_id': '1990'},
    {'movie_id': '12123'},
    {'movie_id': '17915'},
  ];
  

const numUsersToGenerate = 10;
generateDummyUsers(numUsersToGenerate, movieData);
