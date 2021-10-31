let express = require('express');
let createError = require('http-errors');
let path = require('path');
let logger = require('morgan');

let passport = require('passport');
let config = require('./config');

// all router importing
let indexRouter = require('./routes/index');
let dishRouter = require('./routes/dishRouter');
let promoRouter = require('./routes/promoRouter');
let leaderRouter = require('./routes/leaderRouter');
let usersRouter = require('./routes/users');
let uploadRouter = require('./routes/uploadRouter')
let favoriteRouter = require('./routes/favoritesRouter');
let commentRouter = require('./routes/commentRouter')

let app = express();

// connecting to database
const mongoose = require('mongoose')
const url = config.mongoUrl
const connect = mongoose.connect(url)
connect.then((db) => {
	console.log('Connected correctly to the server')
}, (err) => {
	console.log(err)
})

// secure traffic only, redirect all http to https
app.all('*', (req, res, next) => {
	if (req.secure)
		return next()
	else
		res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url)
})

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))

// to add all the information we pass to the API to the request.body object
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Passport Middleware =================================================================================
// passport.initialize() middleware is required to initialize Passport.
// If app use persistent login sessions, passport.session() middleware must also be used.
app.use(passport.initialize())
// app.use(passport.session())
// =====================================================================================================

// ROUTING
app.use('/', indexRouter)
app.use('/users', usersRouter)

// to serve static pages from public folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/dishes', dishRouter)
app.use('/promotions', promoRouter)
app.use('/leaders', leaderRouter)
app.use('/imageUpload', uploadRouter)
app.use('/favorites', favoriteRouter)
app.use('/comments', commentRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;