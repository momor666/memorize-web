const wordController   = require('../app/WordController');

module.exports = function(app, passport) {
    
    app.get('/api/words',  wordController.retWords);
    
    app.post('/words/create', wordController.processCreate);
    
    app.post('/words/:slug', wordController.processEdit);
    
};
