const sql = require("../models/db.js");


// constructor
const Favorite = function(favorite) {
  this.date = favorite.date;
  this.user_id = favorite.userId;
  this.post_id = favorite.postId;
};

Favorite.create = (newFavorite, result) => {
	sql.query("INSERT INTO favorites SET ?", newFavorite, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
    result(null, { message: "Favoris ajouté" });
	});
};

Favorite.delete = (postId, userId, result) => {
	if (postId && userId){
    let query = `DELETE FROM favorites WHERE post_id = ${postId} AND user_id = ${userId}`
    sql.query(query, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      result(null, { message: "Favoris supprimé" });
    });
  }
};

Favorite.findIsFavorite = (postId, userId, result) => {
  if (postId && userId) {
    let query = `SELECT * FROM favorites WHERE post_id = ${postId} AND user_id=${userId}`;
    sql.query(query, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err,null);
        return;
      }

      if (res.length === 1) {
        result(null, res);
        return;
      }
    
      // not found favorites
      result({ kind: "not_found" }, false);
    });
  }
}


module.exports = Favorite