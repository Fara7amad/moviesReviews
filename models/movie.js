const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema(
     {
          id: {
               type: Number,
               required: true
          },
          imdb_id: {
               type: String,
               required: false
          },
          popularity: {
               type: Number,
               required: true,
               default: 0
          },
          title: {
               type: String,
               required: true
          },
          cast: {
               type: String,
               required: true
          },
          director: {
               type: String,
               required: true
          },
          keywords: {
               type: String,
               required: true
          },
          overview: {
               type: String,
               required: true
          },
          runtime: {
               type: Number,
               required: false
          },
          genres: {
               type: String,
               required: true
          },
          production_companies: {
               type: String,
               required: false
          },
          release_date: {
               type: String,
               required: false
          },
          vote_count: {
               type: Number,
               required: true,
               default: 0
          },
          rating: {
               type: Number,
               required: true,
               default: 0
          },
          release_year: {
               type: Number,
               required: false
          },
          poster_file_path: {
               type: String,
               required: false
          },
          //todo
          // parental_guide: {
          //      type: String,
          //      required: true
          // },
          // reviews: [
          //      {
          //           user_id: {
          //                type: mongoose.Types.ObjectId,
          //           },
          //           review_text: {
          //                type: String
          //           }

          //      }
          // ]
     },
     { timestamps: true }
)

module.exports = mongoose.model('Movie', movieSchema)
