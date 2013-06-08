var express = require('express'),
    http = require('http'),
    leo = require('./routes/leos'),
    config = require('./config.json'),
    passport = require('passport');

var MemoryStore = express.session.MemoryStore;

require('./strategy');
var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 80);
    app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
   // app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.cookieParser(config.session.secret));
    app.use(express.session({
        store: new MemoryStore(),
        secret: config.session.secret
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express.static(__dirname + '/Lea'));
    app.use('views', __dirname + '/views');
    app.set('view engine', 'jade');
   
});
 
 



app.post('/api/users/:id/machines', leo.addMachine);

app.get('/', function(req, res) {
    res.render('lea',{user:req.user});
});
app.all('/rest/*', function(req, res, next) {
    if(req.isAuthenticated()) next();
    else res.redirect('/');
});
app.get('/rest/users', leo.searchLeo);
app.get('/rest/users/:id', leo.findById);
//app.post('/rest/users', user.addUser);
//app.put('/rest/users/:id', user.updateUser);
//app.delete('/rest/users/:id', user.deleteUser);

app.post('/rest/users/:id/machines', leo.addMachine);
app.put('/rest/users/:id/machines/:id_machine', leo.updateMachine);
app.delete('/rest/users/:id/machines/:id_machine', leo.deleteMachine);

app.post('/auth/login',
	passport.authenticate('ldap', {
		successRedirect: '/leos',
		failureRedirect: '/login'
	}),
	function(req, res){
		console.log('Auth: ok');
	}
);
app.get('/auth/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/debug', function(req, res){
    res.render('debug',{blarg:req.user});
});

app.get(/^\/\w+\/?$/,function(req, res) {
    if(req.isAuthenticated()) res.render('lea',{user:req.user});
    else res.render('login'); 
});



http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});

process.on('uncaughtException', function(err){
  console.log('Exception: ' + err.stack);
});