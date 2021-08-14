const express = require('express');
const createError = require('http-errors');
const path = require('path');
const logger = require('morgan');

const passport = require('passport');
const config = require('./config');

// all router importing
const indexRouter = require('./routes/index');
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');
const usersRouter = require('./routes/users');
const uploadRouter = require('./routes/uploadRouter')
const favoriteRouter = require('./routes/favoritesRouter');
const commentRouter = require('./routes/commentRouter')

const app = express();

// secure traffic only, redirect all http to https
app.all('*', (req, res, next) => {
	if (req.secure)
		return next()
	else
		res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url)
})

// connecting to database
const mongoose = require('mongoose')
const url = config.mongoUrl
const connect = mongoose.connect(url)
connect.then(() => {
	console.log('Connected correctly to the server')
}, (err) => { console.log(err) })

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))

// to add all the information we pass to the API to the request.body object
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// to serve static pages from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Passport Middleware =================================================================================
// passport.initialize() middleware is required to initialize Passport.
// If app use persistent login sessions, passport.session() middleware must also be used.
app.use(passport.initialize())
app.use(passport.session())
// =====================================================================================================

// ROUTING
app.use('/', indexRouter)
app.use('/users', usersRouter)
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