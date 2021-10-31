// passport things
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;

// requires the model with Passport-Local Mongoose plugged in 
let User = require('./models/user');

// for use with jwt
let JwtStrategy = require('passport-jwt').Strategy;
let ExtractJwt = require('passport-jwt').ExtractJwt;

// to sign and verify JSON web tokens
let jwt = require('jsonwebtoken');
let FacebookTokenStrategy = require('passport-facebook-token');

// configuration file
let config = require('./config');




// =========================================================================================================================
// ================================================ Local Strategy  ========================================================
// =========================================================================================================================

// use User.createStrategy instead of authenticate() , starting with version 0.2.1
passport.use(new LocalStrategy(User.authenticate())); // .authenticate() method provided by passport-local-mongoose
/*
    passport.session() middleware was used in app.js (main driver)
    In a typical web app, the credentials used to authenticate a user will only be transmitted during the login req.
    If auth succeeds, a session will be established and maintained via a cookie set in the user's browser.
    Each subsequent req will not contain credentials, but rather the unique cookie that identifies the session.
    In order to support login sessions, Passport will serialize and deserialize user instances to and from the session.
*/
passport.serializeUser(User.serializeUser()); // .serializeUser() provided by passport-local-mongoose plugin
passport.deserializeUser(User.deserializeUser()); // .deserializeUser() provided by passport-local-mongoose plugin





// ==========================================================================================================================
// ==============================================JSON WEB TOKEN  ============================================================
// ==========================================================================================================================

exports.getToken = (user) => {
    return jwt.sign(user, config.secretKey)
    // , { expiresIn: 3600 } currently removed
}





// ==========================================================================================================================
// ===============================================  JWT Strategy  ===========================================================
// ==========================================================================================================================

// options is an object literal containing options to control how the token is extracted from the request or verified
let opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = config.secretKey

// new JwtStrategy(options, verify())
exports.jwtPassport = passport.use(new JwtStrategy(opts,

    // jwt_payload is an object literal containing the decoded JWT payload
    // done is a passport error first callback accepting arguments done(error, user, info)
    (jwt_payload, done) => {
        console.log('JWT payload: ', jwt_payload)

        User.findOne({ id: jwt_payload.sub }, (err, user) => {
            if (err)
                return done(err, false)
            if (user)
                return done(null, user)
            else
                return done(null, false)
        })
    }))
/*
    app.post('/login', passport.authenticate('jwt', {session: false}))
*/
exports.verifyUser = passport.authenticate('jwt', { session: false })





// ==========================================================================================================================
// ==========================================================================================================================
// ==========================================================================================================================

exports.verifyAdmin = (req, res, next) => {

    if (!req.user.admin) {

        console.log(req.user.username)
        let err = new Error("You are not authorized to perform this operation!")
        err.status = 403
        return next(err)
    }

    let err;
    if (req.user.admin) {
        return next()
    } else {
        err = new Error('Admin Verification Failed!')
        err.status = 500
        return next(err)
    }
}


// ==========================================================================================================================
// ==========================================================================================================================
// ==========================================================================================================================


exports.facebookPassport = passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({ facebookId: profile.id }, (err, user) => {
        if (err)
            return done(err, false)
        if (!err && user !== null)
            return done(null, user)
        else {
            user = new User({ username: profile.displayName })
            user.facebookId = profile.id
            user.firstname = profile.name.givenName
            user.lastname = profile.name.familyName
            user.save((err, user) => {
                if (err)
                    return done(err, false)
                else
                    return done(null, user)
            })
        }
    })
}))