const WordModel = require('../models/Word');
const async = require('async');
module.exports = {

  showWords(req, res) {
    WordModel.find({}, (err, words) => {
      if (err) {
        res.status(404);
        res.send('Words not found!');
      }
  
      res.render('words', { 
        words: words,
        user : req.user,
        success: req.flash('success')
      });
    });
  },

  retWords(req, res) {
    WordModel.find({}, {__v : 0}, {sort: {character: 1, created: -1}}, function(err, datas){
      if (err) {
        res.status(404);
        res.send('Word not found!');
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
      res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST");
      res.send("{\"memorize\":"+JSON.stringify(datas, null, " ")+"}");
    });
  },
  
  apiCreate(req, res) {

    const word = new WordModel({
      character: req.body.character,
      meanings: req.body.meanings,
      meaningsMongolia: req.body.meaningsMongolia,
      partOfSpeech: req.body.partOfSpeech,
      kanji: req.body.kanji,
      level: req.body.level
    });
    
    WordModel.find({character : req.body.character}, function (err, docs) {
      if (!docs.length){
         word.save((err) => {
          if (err) {
            res.json({ status: 'failed', message: err});
          }
          res.json({ status: 'success', message: 'Success'});
        });
      } else {                
        res.json({ status: 'duplicated', message: 'Already exists', character: req.body.character});
      }
    });
  },
  
  createMulti(req, res) {
    
    const list = JSON.parse(req.body.new);
    
    var success = 0; 
    var failed = 0; 
    var duplicated = 0;
    
    async.each(list, function(item, callback){
      const word = new WordModel({
        character: item.character,
        meanings: item.meanings,
        meaningsMongolia: item.meaningsMongolia,
        partOfSpeech: item.partOfSpeech,
        kanji: item.kanji,
        level: item.level
      });
      
      WordModel.find({character : item.character}, function (err, docs) {
        if (!docs.length){
          word.save((err) => {
            if (err) {
              failed++;
            }
            success++;
            callback();
          });
        } else {      
          duplicated++;
          callback();
        }
      });
    }, function (error) {
      if (error) res.json({status: 'failed', message: error});
      return res.json({ status: 'success', message: 'Successfully send server. Success: '+success+' Failed: '+failed+' Duplicated: '+duplicated});
    });
  },

  editMulti(req, res){
    const updatedList = JSON.parse(req.body.updated);
     async.each(updatedList, function(item, callback){
      
      const query = WordModel.where({ _id: item.id });
      query.findOne(function(err, word){
        
        if (err) {
          res.status(404);
          res.json({ status: 'failed', message: err});
        }
        
        word.character = item.character;
        word.meanings = item.meanings;
        word.meaningsMongolia = item.meaningsMongolia;
        word.partOfSpeech = item.partOfSpeech;
        word.kanji = item.kanji;
        word.level = item.level;
        word.isFavorite = item.isFavorite;
        word.isMemorize = item.isMemorize;
        
        word.save((err) => {
          if (err) {
            res.json({ status: 'failed', message: err});
          }
          callback();
        });
      });
    }, function(error){
      if (error) {
        res.json({status: 'failed', message: error});
      }
      return res.json({ status: 'success', message: 'Successfully sync datas '+updatedList.length }); 
    });
  },
  
  showSingle(req, res) {
    WordModel.findOne({ _id: req.params.id }, (err, word) => {
      if (err) {
        res.status(404);
        res.send('Word not found!');
      }
  
      res.render('single', { 
        word: word,
        user : req.user,
        success: req.flash('success')
      });
    });
  },
  
  seedWords(req, res) {
    const words = [
      { character: "いいえ", meanings: "no", meaningsMongolia: "үгүй", partOfSpeech: "nouns", kanji: "", level: "jlpt5"},
      { character: "あい", meanings: "love", meaningsMongolia: "хайр", partOfSpeech: "nouns", kanji: "愛", level: "jlpt5"},
      { character: "いえ", meanings: "house", meaningsMongolia: "байшин", partOfSpeech: "nouns", kanji: "家", level: "jlpt5"},
      { character: "あお", meanings: "blue", meaningsMongolia: "цэнхэр", partOfSpeech: "nouns", kanji: "青", level: "jlpt5"},
      { character: "おい", meanings: "nephew", meaningsMongolia: "зээ", partOfSpeech: "nouns", kanji: "甥", level: "jlpt5"},{ character: "いいえ", meanings: "no", meaningsMongolia: "үгүй", partOfSpeech: "nouns", kanji: "", level: "jlpt5"},
      { character: "いい", meanings: "good", meaningsMongolia: "сайн", partOfSpeech: "nouns", kanji: "", level: "jlpt5"},
      { character: "あう", meanings: "meet", meaningsMongolia: "уулзах", partOfSpeech: "nouns", kanji: "合う", level: "jlpt5"},
      { character: "かい", meanings: "shellfish", meaningsMongolia: "дун", partOfSpeech: "nouns", kanji: "回", level: "jlpt5"},
      { character: "あか", meanings: "red", meaningsMongolia: "улаан", partOfSpeech: "nouns", kanji: "赤", level: "jlpt5"}
    ];

    WordModel.remove({}, () => {
      for (word of words) {
        const newWord = new WordModel(word);
        newWord.save();
        
      }
    });
    
    res.send('Wordbase seeded!');
  },
  
  showCreate(req, res) {
    res.render('create', {
      user : req.user,
      errors: req.flash('errors')
    });
  },
  
  processCreate(req, res) {
    req.checkBody('character', 'Character is required.').notEmpty();
    req.checkBody('meanings', 'Meanings is required.').notEmpty();
   
    const errors = req.validationErrors();
    if (errors) {
      req.flash('errors', errors.map(err => err.msg));
      return res.redirect('/words/create');
    }
    
    const word = new WordModel({
      character: req.body.character,
      meanings: req.body.meanings,
      meaningsMongolia: req.body.meaningsMongolia,
      partOfSpeech: req.body.partOfSpeech,
      kanji: req.body.kanji,
      level: req.body.level
    });
    
    WordModel.find({character : req.body.character}, function (err, docs) {
      if (!docs.length){
          word.save((err) => {
            if (err) {
              throw err;
            }
            
            res.redirect(`/`);
          });
      } else {                
          console.log('Word exists: ',req.body.character);
          req.flash('errors', req.body.character+' aleady exists.');
          res.redirect('/words/create');
      }
    });
  },
  
  showEdit(req, res) {
    WordModel.findOne({ _id: req.params.id }, (err, word) => {
      res.render('edit', {
        word: word,
        user : req.user,
        errors: req.flash('errors')
      });
    });
  },
  
  processEdit(req, res) {
    req.checkBody('character', 'Character is required.').notEmpty();
    req.checkBody('meanings', 'Meanings is required.').notEmpty();
    const errors = req.validationErrors();
    if (errors) {
      req.flash('errors', errors.map(err => err.msg));
      return res.redirect(`/words/${req.params.id}/edit`);
    }
    WordModel.findOne({ _id: req.params.id }, (err, word) => {
      word.character = req.body.character;
      word.meanings = req.body.meanings;
      word.meaningsMongolia = req.body.meaningsMongolia;
      word.partOfSpeech = req.body.partOfSpeech;
      word.kanji = req.body.kanji;
      word.level = req.body.level
 
      word.save((err) => {
        if (err)
          throw err;
        req.flash('success', 'Successfully updated word.');
        res.redirect('/words');
      });
    });
  
  },
  
  deleteWord(req, res) {
    WordModel.remove({ _id: req.params.id }, (err) => {
      req.flash('success', 'Word deleted!');
      res.redirect('/words');
    });
  },
  
  wordCount(req, res) {
    WordModel.count({}, function(error, numOfDocs) {  
      res.send('Word count '+numOfDocs);
    });
  }
}
