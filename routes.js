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
                find({user: req.user._id, out: null}).
                sort('-date').
                limit(1).
                exec(function(err, punch){
                    if(punch.length == 1){
                        res.render('puncher', { punch: punch[0], now: Date.now(), user : req.user });
                    }else{
                        res.render('puncher', { punch: {in: null}, now: Date.now(), user : req.user });
                    }
                });
        }else{
            res.redirect('/login');
        }
    });

    app.post('/puncher', function(req, res) {
        if(!req.body.punchin || !req.user) res.redirect('/puncher');

        if(req.body.punchin == 'true'){
            var punch = new Punch({in: Date.now(), user: req.user._id});
            punch.save();
        } else {
            Punch.
                find({user: req.user._id, out: null}).
                sort('-date').
                limit(1).
                exec(function(err, punch){
                    if(punch.length == 1){
                        punch[0].out =  Date.now();
                        punch[0].save();
                    }
                });
        }
        res.redirect('/puncher');
    });

    function sendPounches(user, from, to, res){
        Punch.
            find({
                user: user._id,
                in: { $lt: to, $gt: from }
            }).
            sort('-date').
            limit(100).
            exec(function(err, punches){
                var days = {};
                if(typeof(punches) === 'undefined') punches = [];

                punches.forEach(function(punch){
                    var day = parseInt(punch.in.getTime() / 1000 / 60 / 60 / 24);
                    if(typeof(days[day]) == 'undefined'){
                        days[day] = {};
                        days[day].punches = [];
                        days[day].day = day * 24 * 60 * 60 * 1000;
                        days[day].total_int = 0;
                        days[day].total = "";
                    }
                    days[day].punches.push(punch);
                    if(punch.out){
                        days[day].total_int += (
                            punch.out.getTime() - punch.in.getTime()
                        );
                        var diff_len = days[day].total_int;

                        var hh = Math.floor(diff_len / 1000 / 60 / 60);
                        diff_len -= hh * 1000 * 60 * 60;
                        var mm = Math.floor(diff_len / 1000 / 60);
                        diff_len -= mm * 1000 * 60;
                        var ss = Math.floor(diff_len / 1000);
                        diff_len -= ss * 1000;

                        days[day].total = (
                            `${hh} Hours ${mm} Minutes ${ss} Seconds`
                        );
                    }
                });
                var next = new Date(to.getFullYear(), to.getMonth() + 1);
                var previous = new Date(to.getFullYear(), to.getMonth() - 1); 
                res.render('punches', {
                    days: days,
                    user : user,
                    from: from,
                    to: to,
                    next: next,
                    previous: previous
                });
            });
    }

    app.get('/punches', function(req, res) {
        if(!req.user) res.redirect('/login');
        var d = new Date(),
        month = d.getMonth(),
        year = d.getFullYear();

        console.log(month);

        sendPounches(
            req.user,
            new Date(year, month, 1),
            new Date(year, month + 1, 0),
            res
       );
    });
    
    app.get('/punches/:year/:month', function(req, res) {
        if(!req.user) res.redirect('/login');

        sendPounches(
            req.user,
            new Date(req.params.year, parseInt(req.params.month) - 1, 1),
            new Date(req.params.year, parseInt(req.params.month), 0),
            res
        );
    });

    app.get('/punch', function(req, res){
        if(!req.user) res.redirect('/login');
        res.render('punch', {punch: {in: new Date(), out: new Date(), _id: ''}, user : req.user });
    });

    app.post('/punch', function(req, res){
        if(!req.user) res.redirect('/login');

        var punch = new Punch();
        if(req.body.in) punch.in = (new Date(req.body.in).getTime());
        if(req.body.out) punch.out = (new Date(req.body.out).getTime());
        punch.user = req.user._id;
        punch.save();

        res.redirect('/punch/new');
    });


    app.get('/punch/:punch_id', function(req, res){
        if(!req.user) res.redirect('/login');
        Punch.findOne({ _id: req.params.punch_id, user: req.user._id }, function (err, punch) {
            if(!punch) {
                res.redirect('/punches');
                return;
            }
            res.render('punch', {punch: punch, user : req.user });
        });
    });

    app.post('/punch/:punch_id', function(req, res) {
        if(!req.user) res.redirect('/login');
        Punch.findOne({ _id: req.params.punch_id, user: req.user._id }, function (err, punch) {
            if(!punch) {
                res.redirect('/punches');
                return;
            }
            if(req.body.in) punch.in = (new Date(req.body.in).getTime());
            if(req.body.out) punch.out = (new Date(req.body.out).getTime());
            punch.save();
            res.render('punch', {punch: punch, user : req.user });
        });
        ;
    });

    app.get('/punch/:punch_id/delete', function(req, res){
        if(!req.user) res.redirect('/login');
        Punch.findOne({ _id: req.params.punch_id, user: req.user._id }, function (err, punch) {
            if(!punch) return;
            punch.remove();
        });
        res.redirect('/punches');
    });


    app.get('/register', function(req, res) {
        res.render('register', { });
    });

    app.post('/register', function(req, res) {
        User.register(new User({
                username : req.body.username
        }), req.body.password, function(err, user) {
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
