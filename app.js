var express = require('express')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var FileStore = require('session-file-store')(session)
var createError = require('http-errors')
var path = require('path')
var logger = require('morgan')

var indexRouter = require('./routes/index')
var dishRouter = require('./routes/dishRouter')
var promoRouter = require('./routes/promoRouter')
var leaderRouter = require('./routes/leaderRouter')
var usersRouter = require('./routes/users')

var app = express();

const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/conFusion'
const connect = mongoose.connect(url)
connect.then(() => {
	console.log('Connected correctly to the server')
}, (err) => { console.log(err) })

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// app.use(cookieParser("23232-32334-33333-23134"));
app.use(session({
	name: 'session-id',
	secret: '33343-37463-37462-46372',
	saveUninitialized: false,
	resave: false,
	store: new FileStore()
}))

app.use('/', indexRouter)
app.use('/users', usersRouter)

function auth(req, res, next) {
	console.log(req.session)

	if (!req.session.user) {
		var err = new Error('You are not authenticated!')
		res.setHeader('WWW-Authenticate', 'Basic')
		err.status = 403
		return next(err)
	} else {
		if (req.session.user === 'authenticated') {
			next()
		}
		else {
			var err = new Error('You are not authenticated!')
			err.status = 403
			return next(err)
		}
	}
}

app.use(auth)

app.use(express.static(path.join(__dirname, 'public')));  // to serve static pages from public folder

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
