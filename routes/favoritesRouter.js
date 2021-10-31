const express = require("express");

let authenticate = require("../authenticate");
const cors = require("./cors");

const Favorites = require("../models/favorite");
const {response} = require("express");

const favoritesRouter = express.Router();

favoritesRouter.use(express.json());

favoritesRouter.route("/")
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ 'user': req.user._id })
            .populate("user")
            .populate("dishes")

            // .exec is part of the Mongoose API
            // another way to execute query, instead of using callback or promises
            // .exec((err, favorites) => {
            //     if (err) return next(err);
            //     res.statusCode = 200;
            //     res.setHeader("Content-Type", "application/json");
            //     res.json(favorites);
            // });

            // simple
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, err => next(err))
            .catch(err => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({'user': req.user._id}, (err, favorites) => {
            if(err) return next(err)

            if(favorites == null) {
                Favorites.create({'user': req.user._id, 'dishes': req.body})
                    .then(favoriteDishes => {
                        Favorites.findById(favoriteDishes._id)
                            .populate('user')
                            .populate('dishes')
                            .then(favorite => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })
                    }, err => next(err))
                    .catch(err => next(err))
            } else {
                let newFavorites = []
                Favorites.findOne(favorites._id)
                    .then(favorites => {
                        for(let i = 0;i<req.body.length;i++) {
                            let favoriteObject = req.body[i]._id
                            if(favorites.dishes.indexOf(favoriteObject) === -1) {
                                newFavorites.push(favoriteObject)
                            }
                        }
                        Favorites.findByIdAndUpdate(favorites._id, {
                            $push: {'dishes': newFavorites}
                        }, {upsert: true, new: true})
                            .populate('user')
                            .populate('dishes')
                            .then((favouriteDishes) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favouriteDishes);
                            }, (err) => next(err))
                            .catch((err) => next(err));
                    })
            }
        })
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.setHeader('Content-type', 'text/plain')
        res.end("PUT operation not supported on /favorites");
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Favorites.findOneAndRemove({ 'user': req.user._id }, (err, resp) => {
            if (err) return next(err)
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(resp);
        })
    });

favoritesRouter.route("/:dishId")
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {

        // finding current user's favorite dish list in db
        Favorites.findOne({ user: req.user._id })
            .then((favorites) => {
                // fav is null, user has not added any fav dishes
                if (!favorites) {
                    res.statusCode = 200;
                    res.setHeader("Content-type", "application/json");
                    return res.json({
                        'exists': false,
                        'favorites': favorites,
                    });
                }

                // fav is not null
                else {
                    // checking if req.params.dishId exists in that fav dishes
                    // if it does not exist, the index will be negative
                    if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                        res.statusCode = 200;
                        res.setHeader("Content-type", "application/json");
                        return res.json({
                            'exists': false,
                            'favorites': favorites,
                        });
                    } else {
                        res.statusCode = 200;
                        res.setHeader("Content-type", "application/json");
                        return res.json({
                            'exists': true,
                            'favorites': favorites,
                        });
                    }
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id }, (err, favorite) => {
            if (err) return next(err)
            if (favorite == null) {
                Favorites.create({ 'user': req.user._id, 'dishes': [req.params.dishId] })
                .then((favoriteDishes) => {
                    Favorites.findById(favoriteDishes._id)
                        .populate('user')
                        .populate('dishes')
                        .then((favorite) => {
                            res.statusCode = 200
                            res.setHeader("Content-Type", "application/json");
                            res.json(favorite);
                    })
                }, err => next(err))
                .catch((err) => next(err))
            } else {
                let newFavorites = []
                Favorites.findOne(favorite._id)
                    .then(favorite => {
                        if(favorite.dishes.indexOf(req.params.dishId) === -1) {
                            newFavorites.push(req.params.dishId)
                        }

                        Favorites.findByIdAndUpdate(favorite._id, {
                            $push: {
                                'dishes': newFavorites
                            }
                        }, {upsert: true, new: true})
                            .populate('user')
                            .populate('dishes')
                            .then(favDishes => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favDishes);
                            }, err => next(err))
                            .catch(err => next(err))
                    })
            }
        })
    })

    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end("PUT operation not supported on /favorites/dishId");
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id }, (err, favorite) => {
            if(err) return next(err)

            if(favorite.dishes.indexOf(req.params.dishId) >= 0) {
                favorite.dishes.pull(req.params.dishId);
                favorite.save()
                    .then((favorite) => {
                        Favorites.findById(favorite._id)
                            .populate('user')
                            .populate('dishes')
                            .then((favorite) => {
                                res.statusCode = 200
                                res.setHeader("Content-Type", "application/json");
                                res.json(favorite);
                            })
                    }, err => next(err))
                    .catch(err => next(err))
            }

            else {
                res.statusCode = 404
                res.setHeader('Content-type', 'text/plain')
                res.end('Dish ' + req.params.dishId + ' not in your favorite list')
            }
        })
    })

module.exports = favoritesRouter;
