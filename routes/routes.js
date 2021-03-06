const mainController   = require('../app/MainController'),
      wordController   = require('../app/WordController');
      
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}

module.exports = function(app, passport) {
    
    app.get('/', isLoggedIn, mainController.showDashboard);
	
    app.get('/words', isLoggedIn, wordController.showWords);
    
    app.get('/api/words',  wordController.retWords);
        
    app.post('/api/word/create', wordController.apiCreate);
    
    app.post('/api/multi/create', wordController.createMulti);
    
    app.post('/api/multi/edit', wordController.editMulti);
    
    app.get('/words/seed', isLoggedIn, wordController.seedWords);
    
    app.get('/words/count', isLoggedIn, wordController.wordCount);
    
    app.get('/words/create', isLoggedIn, wordController.showCreate);
    app.post('/words/create', isLoggedIn, wordController.processCreate);
    
    app.get('/words/:id/edit', isLoggedIn, wordController.showEdit);
    app.post('/words/:id', isLoggedIn, wordController.processEdit);
    
    app.get('/words/:id/delete', isLoggedIn, wordController.deleteWord);
    
    app.get('/words/:id', isLoggedIn, wordController.showSingle);

    app.get('/login', function(req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });
    
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    
    app.get('/signup', function(req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });
    
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login');
    });
};
