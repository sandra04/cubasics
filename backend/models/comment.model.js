const sql = require("../models/db.js");


// constructor
const Comment = function(comment) {
  this.content = comment.content;
  this.image = comment.image;
  this.audio = comment.audio;
  this.creation_date = comment.creationDate;
  this.modification_date = comment.modificationDate;
  this.likes = comment.likes;
  this.report = comment.report;
  this.user_id = comment.userId;
  this.post_id = comment.postId;
  this.comment_id = comment.commentId;
};

Comment.create = (newComment, result) => {
	sql.query("INSERT INTO comments SET ?", newComment, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
  
	  result(null, { id: res.insertId, ...newComment });
	});
};

Comment.modify = (id, content, modificationDate, image, audio, result) => {
	const myImage = image !== null ? JSON.stringify(image) : null;
	const myAudio = audio !== null ? JSON.stringify(audio) : null;

	if (id){
		let query = `UPDATE comments SET content="${content}", modification_date="${modificationDate}", image=${myImage}, audio=${myAudio} WHERE id=${id}`
		
    sql.query(query, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
    
      console.log("Modify comment");
      result(null, { message: "Commentaire modifié" });
    });
  }
};

Comment.delete = (id,result) => {
	if (id){
    let query = `DELETE FROM comments WHERE id = ${id}`
    sql.query(query, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
    
      console.log("Delete comment");
      result(null, { message: "Commentaire supprimé" });
    });
  }
};

Comment.findCommentsByPost = (postId, userId, result) => {
  if (postId) {
    let query = `SELECT c.*, u.pseudo AS user FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE report = 0 AND c.post_id = ${postId}`;
    sql.query(query, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err,null);
        return;
      }
     
      let comments = []

      if (res.length > 0) {
        
        if (userId){
          res.forEach((comment) => {
            if (userId === comment.user_id){
              const commentToSend = {...comment, isAuthor : true}
              delete commentToSend.user_id
              comment = {...commentToSend}
              comments.push(comment)
            }
            else{
              const commentToSend = {...comment, isAuthor : false}
              delete commentToSend.user_id
              comment = {...commentToSend}
              comments.push(comment)
            }	
          })
          
        }
        else{
          res.forEach((comment) => {
            delete comment.user_id
            comments.push(comment)
          })
        }
      }
      console.log("found comments: ", comments);
      result(null, comments);
      return;

    });
  }
  return null;

};

Comment.findById = (id, result) => {
	sql.query(`SELECT c.*, u.pseudo AS user FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.id = ${id} AND c.report = 0 GROUP BY c.id`, (err, res) => {
	  if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    
    if (res.length) {
      console.log("found comment: ", res[0]);
      result(null, res[0]);
      return;
    }
    
    // not found comment with the id
    result({ kind: "not_found" }, null);
	});
};

  

module.exports = Comment