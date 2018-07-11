const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  slugutf = require('slug');
  
// create a schema
const wordSchema = new Schema({
  character: String,
  meanings: String,
  meaningsMongolia: String,
  partOfSpeech: String, // adj, verb, etc
  kanji: String,
  level: String, // jlpt n1, jlpt n2 
  isFavorite: { 
    type: Boolean, 
    default: false 
  },
  isMemorize: { 
    type: Boolean, 
    default: false 
  },
  created: { 
    type: Date, 
    default: Date.now 
  }
});

const wordModel = mongoose.model('Word', wordSchema);

module.exports = wordModel;
