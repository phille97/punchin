var passport = require('passport');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var User = require('./model/user');
var Punch = require('./model/punch');


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

    app.get('/puncher', function (req, res) {
        if(req.user){
            Punch.
                find({user: req.user._id}).
                sort('-date').
                limit(1).
                exec(function(err, punch){
                    if(punch.length == 1){
                        res.render('puncher', {punch: punch[0], now: Date.now()});
                    }else{
                        res.render('puncher', {punch: {punchin: false, date: Date.now()}, now: Date.now()});
                    }
                });
        }else{
            res.redirect('/login');
        }
    });

    app.post('/puncher', function(req, res) {
        if(!req.body.punchin || !req.user) res.redirect('/puncher');

        if(req.body.punchin == 'true'){
            var punch = new Punch({punchin: true, user: req.user._id});
            punch.save();
        } else {
            var punch = new Punch({punchin: false, user: req.user._id});
            punch.save();

        }
        res.redirect('/puncher');
    });

    app.get('/punches', function(req, res) {
        if(!req.user) res.redirect('/login');
        Punch.
            find({user: req.user._id}).
            sort('-date').
            limit(100).
            exec(function(err, punches){
                var days = {};
                punches.forEach(function(punch){
                    var day = parseInt(punch.date.getTime() / 1000 / 60 / 60 / 24);
                    if(typeof(days[day]) == 'undefined'){
                        days[day] = {};
                        days[day].punches = [];
                        days[day].day = day * 24 * 60 * 60 * 1000;
                    }
                    days[day].punches.push(punch);
                });
                res.render('punches', {days: days});
            });

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
        res.redirect('/puncher');
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/ping', function(req, res){
        res.send("pong", 200);
    });

};
