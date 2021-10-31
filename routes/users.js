let express = require('express');
let router = express.Router();
let User = require('../models/user');
let passport = require('passport');
let authenticate = require('../authenticate');
const cors = require('./cors')

router.use(express.json())

router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200) })

router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	User.find({})
	.then((users) => {
		res.statusCode = 200
		res.setHeader("Content-Type", "application/json")
		res.json(users)
	})
	.catch((err) => {
		res.statusCode = 500
		res.setHeader("Content-Type", "application/json")
		res.json({ err: err })
	})
})

router.post('/signup', cors.corsWithOptions, (req, res, next) => {
	User.register(new User({ username: req.body.username }),
		req.body.password, (err, user) => {
			if (err) {
				res.statusCode = 500;
				res.setHeader('Content-Type', 'application/json');
				res.json({ err: err });
			}
			else {
				if (req.body.firstname)
					user.firstname = req.body.firstname
				if (req.body.lastname)
					user.lastname = req.body.lastname
				user.save((err, user) => {
					if (err) {
						res.statusCode = 500
						res.setHeader('Content-Type', 'application/json')
						res.json({ err: err })
						return
					}
				})
				passport.authenticate('local')(req, res, () => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json({ success: true, status: 'Registration Successful!' });
				});
			}
		});
});

router.post('/login', cors.corsWithOptions, (req, res, next) => {

	passport.authenticate('local', (err, user, info) => {
		if(err) return next(err)
		
		// handle user not found or password not correct problem
		// the reason for unsuccessful is in info
		if(!user) {
			res.statusCode = 401; // 401 unauthorized
			res.setHeader('Content-Type', 'application/json');
			res.json({ success: false, status: 'Login Unsuccessful!', err: info });
		}

		// if reach this point, username and password verification is successful
		// and the passport.authenticate add logIn method to req
		req.logIn(user, (err) => {
			if(err) {
				res.statusCode = 401;
				res.setHeader('Content-Type', 'application/json');
				res.json({ success: false, status: 'Login Unsuccessful!', err: "Could not log in user" });
			}

			let token = authenticate.getToken({ _id: req.user._id });
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json({ success: true, status: 'Login Successful!', token: token });
		})
	}) (req, res, next)
})

router.get('/logout', cors.corsWithOptions, (req, res, next) => {
	if (req.session) {
		req.session.destroy();
		res.clearCookie('session-id');
		res.redirect('/');
	}
	else {
		let err = new Error('You are not logged in!');
		err.status = 403;
		next(err);
	}
})

// login with facebook
router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
	if (req.user) {
		let token = authenticate.getToken({ _id: req.user._id });
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json({ success: true, token: token, status: 'You are successfully logged in!' });
	}
})

// to check if jwt is still valid
router.get('/checkJWTToken', cors.corsWithOptions, (req, res, next) => {
	
	passport.authenticate('jwt', {session: false}, (err, user, info) => {
		if(err) return next(err)

		if(!user) {
			res.statusCode = 401
			res.setHeader('Content-type', 'application/json')
			return res.json({status: 'JWT invalid!', success: false, err: info})
		}

		else {
			res.statusCode = 200
			res.setHeader('Content-type', 'application/json')
			return res.json({status: 'JWT valid', success: true, err: user})
		}
	}) (req, res)
})

module.exports = router;
