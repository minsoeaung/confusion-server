const express = require("express");

const authenticate = require("../authenticate");
const cors = require("./cors");

const Favorites = require("../models/favorite");

const favoritesRouter = express.Router();

favoritesRouter.use(express.json());

favoritesRouter.route("/")
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .populate("user")
            .populate("dishes")

            // .exec is part of the Mongoose API
            // another way to execute query, instead of using callback or promises
            .exec((err, favorites) => {
                if (err) return next(err);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
            });
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .exec((err, favorite) => {
                if (err) return next(err);

                if (!favorite) {
                    Favorites.create({ user: req.user._id })
                        .then((favorite) => {

                            for (i = 0; i < req.body.length; i++)
                                if (favorite.dishes.indexOf(req.body[i]._id) < 0) // a bit nonsense to check this inside if(!favorites)
                                    favorite.dishes.push(req.body[i]._id)

                            favorite.save()
                                .then((favorite) => {
                                    Favorites.findById(favorite._id)
                                        .populate('user')
                                        .populate('dishes')
                                        .then((favorites) => {
                                            res.statusCode = 200;
                                            res.setHeader("Content-Type", "application/json");
                                            res.json(favorites);
                                        })
                                })
                                .catch((err) => {
                                    return next(err);
                                })
                        })
                        .catch((err) => {
                            return next(err);
                        });
                } else {
                    for (i = 0; i < req.body.length; i++)
                        if (favorite.dishes.indexOf(req.body[i]._id) < 0)
                            favorite.dishes.push(req.body[i]._id)

                    favorite.save()
                        .then((favorite) => {
                            Favorites.findById(favorite._id)
                                .populate('user')
                                .populate('dishes')
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader("Content-Type", "application/json");
                                    res.json(favorite);
                                })
                        })
                        .catch((err) => {
                            return next(err);
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
        Favorites.findOneAndRemove({ user: req.user._id }, (err, resp) => {
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
                        exists: false,
                        favorites: favorites,
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
                            exists: false,
                            favorites: favorites,
                        });
                    } else {
                        res.statusCode = 200;
                        res.setHeader("Content-type", "application/json");
                        return res.json({
                            exists: true,
                            favorites: favorites,
                        });
                    }
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id }, (err, favorite) => {
            if (err) return next(err)
            if (!favorite) {
                Favorites.create({ user: req.user._id })
                .then((favorite) => {
                    favorite.dishes.push({ "_id": req.params.dishId })
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
                    })
                    .catch((err) => {
                        return next(err)
                    })
                })
                .catch((err) => {
                    return next(err)
                })
            } 
            
            else {
                res.statusCode = 403
                res.setHeader('Content-type', 'text/plain')
                res.end('Dish ' + req.params.dishId + ' already in favorites')
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
                favorite.dishes.splice(index, 1)
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
                })
                .catch((err) => {
                    return next(err)
                })
            }

            else {
                res.statusCode = 404
                res.setHeader('Content-type', 'text/plain')
                res.end('Dish ' + req.params.dishId + ' not in your favorite list')
            }
        })      
    })

module.exports = favoritesRouter;
