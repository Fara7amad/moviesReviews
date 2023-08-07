const mongoose = require('mongoose')

const usersSchema = new mongoose.Schema(
  {
    firstname: {
        type: String,
        required: false
      },
      lastname: {
        type: String,
        required: false
      },
    username: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      country:{
        type : String,
        required:false
      },
      state:{
        type : String,
        required: false
      },
      password: {
        type: String,
        required: true
      },
      updatedAt: {
        type: Date,
        default: Date.now
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      movieList: [
        {
          movie_id: {
            type: Number,
          },
          rating: {
            type: Number,
            default:null
          },
          liked: {
            type: Boolean,
            default: false
          },
        },
      ],
      avatar:{
        type:String,
        required:true,
        default:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
      }
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', usersSchema)
