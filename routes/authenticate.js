var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('jsonwebtoken');

var config = require('./config');

exports.local = passport.use(new LocalStrategy(User.authenticate()));