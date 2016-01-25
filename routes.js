var passport = require('passport');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var User = require('./model/user');

var session_secret = 'your secret here';

module.exports = function (app) {
    app.use(methodOverride());
    app.use(cookieParser(session_secret));
    app.use(expressSession({secret: session_secret}));
    app.use(passport.initialize());
    app.use(passport.session());
    
    app.get('/', function (req, res) {
        res.render('index', { user : req.user });
    });

    app.get('/register', function(req, res) {
        res.render('register', { });
    });

    app.post('/register', function(req, res) {
        User.register(new User({ username : req.body.username }), req.body.password, function(err, user) {
            if (err) {
                return res.render('register', { user: user });
            }

            passport.authenticate('local')(req, res, function () {
                res.redirect('/');
            });
        });
    });

    app.get('/login', function(req, res) {
        res.render('login', { user : req.user });
    });

    app.post('/login', passport.authenticate('local'), function(req, res) {
        res.redirect('/');
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/ping', function(req, res){
        res.send("pong", 200);
    });

};
