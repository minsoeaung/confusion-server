var express = require('express');
var cookieParser = require('cookie-parser');
var createError = require('http-errors');
var path = require('path');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var dishRouter = require('./routes/dishRouter')
var promoRouter = require('./routes/promoRouter')
var leaderRouter = require('./routes/leaderRouter')
var usersRouter = require('./routes/users');

var app = express();

const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/conFusion'
const connect = mongoose.connect(url)
connect.then(() => {
	console.log('Connected correctly to the server')
}, (err) => { console.log(err) })

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser("23232-32334-33333-23134"));

function auth(req, res, next) {

	if (!req.signedCookies.user) {
		var authHeader = req.headers.authorization;
		if (!authHeader) {
			var err = new Error('You are not authenticated!');
			res.setHeader('WWW-Authenticate', 'Basic');
			err.status = 401;
			next(err);
			return;
		}
		var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
		var user = auth[0];
		var pass = auth[1];
		if (user == 'admin' && pass == 'password') {
			res.cookie('user', 'admin', { signed: true }); // set cookie
			next(); // authorized
		} else {
			var err = new Error('You are not authenticated!');
			res.setHeader('WWW-Authenticate', 'Basic');
			err.status = 401;
			next(err);
		}
	}
	else {
		if (req.signedCookies.user === 'admin') next();
		else {
			var err = new Error('You are not authenticated!');
			err.status = 401;
			next(err);
		}
	}
}


app.use(auth)

app.use(express.static(path.join(__dirname, 'public')));  // to serve static pages from public folder

// routing
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes', dishRouter)
app.use('/promotions', promoRouter)
app.use('/leaders', leaderRouter)

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
