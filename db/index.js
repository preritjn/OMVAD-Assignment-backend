const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_DB_CONNECT + 'database')

const userSchema = new mongoose.Schema({
    email : {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password : {
        type: String,
        required: true,
        unique: true
    }    
})

const bookmarkSchema = new mongoose.Schema({
  userId : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String,
    required: true,
  },
  title : {
    type: String,    
    required: true,
  },
  favicon: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  }
})

const User = mongoose.model("User",userSchema)
const Bookmark = mongoose.model("Bookmark",bookmarkSchema)

module.exports = {
    User,
    Bookmark
}