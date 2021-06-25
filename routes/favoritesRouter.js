const express = require('express')
const bodyParser = require('body-parser')

var authenticate = require('../authenticate')
const cors = require('./cors')

const Favorites = require('../models/favorite')

const favoritesRouter = express.Router()

favoritesRouter.use(bodyParser.json())

favoritesRouter
    .route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ 'user': req.user._id })
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(favorites)
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ 'user': req.user._id }, (err, favorites) => {
            // favDishes not exist at all. So, adding all.
            if (favorites == null) {
                Favorites.create({ 'user': req.user._id, 'dishes': req.body })
                    .then((favDishes) => {
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'application/json')
                        res.json(favDishes)
                    }, (err) => next(err))
                    .catch((err) => next(err))
            } else if (favorites != null) {
                // some favDishes exist. Adding each dish that is not already in favDishes.
                for (var i = 0; i < req.body.length; i++) {
                    if (favorites.dishes.indexOf(req.body[i]._id) < 0)
                        favorites.dishes.push(req.body[i]._id)
                }
                // save the changes and response back to user
                favorites.save()
                    .then((favDishes) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favDishes);
                    }, (err) => next(err))
                    .catch((err) => next(err))
            }
        })
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403
        res.end("PUT operation not supported on /favorites")
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Favorites.findOne({ 'user': req.user._id })
            .then((fav) => {
                if (fav != null) {
                    fav.remove({})
                        .then((resp) => {
                            res.statusCode = 200
                            res.setHeader("Content-Type", "application/json")
                            res.json(resp)
                        }, (err) => next(err))
                        .catch((err) => next(err))
                } else {
                    return 'No favorite dishes to remove'
                }
            })
    })



favoritesRouter
    .route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403
        res.end('GET operation not supported on /favorites/dishId')
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ 'user': req.user._id }, (err, favorites) => {
            if (favorites == null) {
                Favorites.create({ 'user': req.user, 'dishes': [req.params.dishId] })
                    .then((favDishes) => {
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'application/json')
                        res.json(favDishes)
                    }, (err) => next(err))
                    .catch((err) => next(err))
            } else if (favorites.dishes.indexOf(req.params.dishId) !== -1) {
                return 'Already exists in favorites'
            } else {
                favorites.dishes.push({ _id: req.params.dishId })
                favorites.save()
                    .then((fav) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(fav);
                    }, (err) => next(err))
                    .catch((err) => next(err))
            }

        })
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403
        res.end('PUT operation not supported on /favorites/dishId')
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ 'user': req.user._id })
            .then((fav) => {
                if (fav) {
                    temp = fav.dishes.indexOf(req.params.dishId)
                    if (temp >= 0) {
                        fav.dishes.splice(temp, 1)
                        fav.save()
                            .then((fav) => {
                                res.statusCode = 200
                                res.setHeader('Content-Type', 'application/json');
                                res.json(fav)
                            }, (err) => next(err))
                            .catch((err) => next(err))
                    } else {
                        err = new Error('Dish ' + req.params.dishId + ' not exist in favorites.')
                        err.status = 404
                        return next(err)
                    }
                } else {
                    err = new Error('No favorites to delete')
                    err.status = 404
                    return next(err)
                }
            }, (err) => next(err))
            .catch((err) => next(err))
    })

    module.exports = favoritesRouter