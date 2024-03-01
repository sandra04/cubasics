
const Favorite = require ("../models/favorite.model.js");


exports.createFavorite = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  
  // Create a favorite
  const favorite = new Favorite({
    date: req.body.date,
    userId: req.auth.userId,
    postId: req.body.postId
  });

  // Save favorite in the database
  Favorite.create(favorite, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the favorite."
      });
    else res.status(200).json({message: "Favoris ajouté !"});
  });
};

exports.deleteFavorite = (req, res, next) => {
  
  const postId = req.body.postId;
  const userId = req.auth.userId;

  Favorite.delete(postId, userId, (err, data) => {
    if (err)
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating the favorite."
    });
    else res.status(200).json({message: "Favoris supprimé !"});
  });
};

exports.postIsFavorite = (req, res, next) => {
  
  const postId = req.body.postId;
  const userId = req.auth.userId;

  Favorite.findIsFavorite(postId, userId, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
            console.log("Not favorite")
            res.status(200).json({isFavorite: false})
            /*res.status(404).send({
                message: "Not found"
            });*/
        }
        else {
          console.log(err.message)
            res.status(500).send({
                message: "Error while retrieving favorites"
            });
        }
      }
      else {
        console.log("Favorite")
        res.status(200).json({isFavorite: true});
      }
  });
};