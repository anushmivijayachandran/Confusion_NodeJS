const express = require('express');
const bodyParser = require('body-parser');
const moongose = require('mongoose');
const authenticate = require('../authenticate');
const Favourites = require('../models/favourite');

const favouriteRouter = express.Router();
favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
.get(authenticate.verifyUser, (req,res,next)=>{
  Favourites.findOne({user: req.user._id})
  .populate('dish')
  .populate('user')
  .then((favourite) => {
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json');
    res.json(favourite);
  },(err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req,res,next) => {
    var dish = [];
    var body = {};
    var j = 0;
  Favourites.findOne({user: req.user._id})
  .then((favourite) => {
    if (favourite == null){
    for (var i = 0; i < req.body.length; i++){
        dish[i] = req.body[i]._id;
      }

      body.user = req.user._id;
      body.dish = dish;
        Favourites.create(body)
        .then((favourite) => {
          res.statusCode = 200;
          res.setHeader('Content-Type','application/json');
          res.json(favourite);
        },(err) => next(err))
        .catch((err) => next(err));
    }
    else{
      for (var i = 0; i < req.body.length; i++){
        if (favourite.dish.indexOf(req.body[i]._id.toString()) == -1){
          favourite.dish.push(req.body[i]._id);
        }
      }
          favourite.save()
          .then((favourite) => {
            Favourites.findById(favourite._id)
            .populate('dish')
            .then((favourite) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favourite);
            })
          },(err) => next(err))
            .catch((err) => next(err));
    }

  })
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favourites/');
})
.delete(authenticate.verifyUser, (req,res,next)=>{
  Favourites.findOne({user: req.user._id })
  .then((favourite) => {
    if (favourite != null) {
      Favourites.findByIdAndRemove(favourite._id)
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
      },(err) => next(err))
        .catch((err) => next(err));
    }
    else {
      err = new Error('You donot have any favurite list to be deleted!!!');
      err.status = 404;
      return next(err);
    }
  },(err) => next(err))
    .catch((err) => next(err));
});

favouriteRouter.route('/:dishId')
.post(authenticate.verifyUser, (req,res,next) => {
  Favourites.findOne({user: req.user._id})
  .then((favourite) => {
    req.body.user = req.user._id;
    req.body.dish = req.params.dishId;
      if (favourite == null){
        console.log("inside first if");
        Favourites.create(req.body)
        .then((favourite) => {
          res.statusCode = 200;
          res.setHeader('Content-Type','application/json');
          res.json(favourite);
        },(err) => next(err))
          .catch((err) => next(err));
      }
      else {
            if (favourite.dish.indexOf(req.params.dishId) != -1){
              err = new Error('The dish ' + req.params.dishId + ' is already added as a favourite!');
              err.status = 404;
              return next(err);
            }
        favourite.dish.push(req.body.dish)
        favourite.save()
        .then((favourite) => {
          Favourites.findById(favourite._id)
          .populate('dish')
          .then((favourite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favourite);
          })
        },(err) => next(err))
          .catch((err) => next(err));
 }

},(err) => next(err))
  .catch((err) => next(err));
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favourites/'+req.params.dishId);
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({dish: req.params.dishId, user: req.user._id })
    .then((favourite) => {
      if(favourite != null && favourite.user.toString() == req.user._id.toString() && favourite.dish.indexOf(req.params.dishId) != -1) {
        favourite.dish.remove(req.params.dishId);
        favourite.save()
            .then((favourite) => {
                Favourites.findById(favourite._id)
                .populate('dish')
                .populate('user')
                .then((favourite) => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(favourite);
                })
              }, (err) => next(err));
    }
    else {
      err = new Error('You donot have this dish in the favourite list to be deleted');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favouriteRouter;
