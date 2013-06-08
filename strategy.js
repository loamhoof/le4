var passport = require('passport'),
	LdapStrategy = require('passport-ldap').Strategy,
	user = require('./routes/users');

	

passport.use(new LdapStrategy({
	server: {
		url: 'ldap://172.30.128.47:389'
	},
	base: 'ou=people,dc=eleves,dc=ec-lille,dc=fr',
	search: {
		filter: '',
		scope: 'one',
		attributes: ['uid']
	}
	},
	function(profile, done) {
		console.log("Auth ok");
		return done(null, JSON.parse(profile));
	}
));

passport.serializeUser(function(user, done) {
  done(null, user.uid);
});

passport.deserializeUser(function(id, done) {
  
    done(null, id);

});