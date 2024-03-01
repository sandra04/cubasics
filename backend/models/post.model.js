const sql = require("../models/db.js");


// constructor
const Post = function(post) {
  this.title = post.title;
  this.content = post.content;
  this.category = post.category;
  this.creation_date = post.creationDate;
  this.modification_date = post.modificationDate;
  this.image = post.image;
  this.audio = post.audio;
  this.views = post.views;
  this.last_view_date = post.lastViewDate;
  this.report = post.report;
  this.user_id = post.userId;
};

Post.create = (newPost, result) => {
	sql.query("INSERT INTO posts SET ?", newPost, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
  
	  result(null, { id: res.insertId, ...newPost });
	});
};


Post.modify = (id, title, content, category, modificationDate, image, audio, user_id, result) => {
	const myImage = image !== null ? JSON.stringify(image) : null;
	const myAudio = audio !== null ? JSON.stringify(audio) : null;

	if (id){
		let query = `UPDATE posts SET title="${title}", content="${content}", category="${category}", modification_date="${modificationDate}"`
		if (myImage){
			query += `, image='${myImage}'`
		}
		else{
			query += `, image=${myImage}`
		}
		query += `, audio=${myAudio} WHERE id=${id}`
		
		sql.query(query, (err, res) => {
			if (err) {
				console.log("error: ", err);
				result(err, null);
				return;
			}
			
			console.log("Modify post");
			result(null, { message: "Post modifié" });
		});
	}
};

Post.modifyViews = (id, views, lastViewDate, result) => {

	if (id){
		let query = `UPDATE posts SET views=${views}, last_view_date="${lastViewDate}" WHERE id=${id}`
		sql.query(query, (err, res) => {
		if (err) {
			console.log("error: ", err);
			result(err, null);
			return;
		}
		
		console.log("Add view");
		result(null, { message: "New view added" });
		});
	}
};

Post.delete = (id, result) => {
	if (id){
		let query = `DELETE FROM posts WHERE id = ${id}`
		sql.query(query, (err, res) => {
		if (err) {
			console.log("error: ", err);
			result(err, null);
			return;
		}
		
		console.log("Delete post");
		result(null, { message: "Post supprimé" });
		});
	}
};

Post.findById = (id, userId, result) => {
	
	sql.query(`SELECT p.*, u.pseudo AS user, COUNT(DISTINCT c.id) AS comments, COUNT(DISTINCT f.id) AS favorites FROM posts p LEFT JOIN users u ON p.user_id = u.id LEFT JOIN comments c ON p.id = c.post_id LEFT JOIN favorites f ON p.id = f.post_id WHERE p.id = ${id} AND p.report = 0 GROUP BY p.id`, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
  
	  if (res.length) {
		if (userId){
			if (userId === res[0].user_id){
				const postToSend = {...res[0], isAuthor : true}
				res[0] = {...postToSend}
			}
			else{
				const postToSend = {...res[0], isAuthor : false}
				res[0] = {...postToSend}
			}	
		}

		result(null, res[0]);
		return;
	  }
  
	  // not found Post with the id
	  result({ kind: "not_found" }, null);
	});
};

Post.findByUserPrivate = (userId, result) => {
	sql.query(`SELECT p.*, NULL as user_id, u.pseudo AS user, COUNT(DISTINCT c.id) AS comments, COUNT(DISTINCT f.id) AS favorites FROM posts p LEFT JOIN users u ON p.user_id = u.id LEFT JOIN comments c ON p.id = c.post_id LEFT JOIN favorites f ON p.id = f.post_id WHERE p.user_id = ${userId} AND p.report = 0 GROUP BY p.id ORDER BY p.id DESC`, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
  
	  if (res.length) {
		res.forEach((post) => {
			delete post.user_id
		})
		console.log("found Post: ", res);
		result(null, res);
		return;
	  }
  
	  // not found Post with the id
	  result({ kind: "not_found" }, null);
	});
};

Post.findByUser = (pseudo, result) => {
	sql.query(`SELECT p.*, NULL as user_id, u.pseudo AS user, COUNT(DISTINCT c.id) AS comments, COUNT(DISTINCT f.id) AS favorites FROM posts p LEFT JOIN users u ON p.user_id = u.id LEFT JOIN comments c ON p.id = c.post_id LEFT JOIN favorites f ON p.id = f.post_id WHERE u.pseudo = "${pseudo}" AND p.report = 0 GROUP BY p.id ORDER BY p.id DESC`, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
  
	  if (res.length) {
		res.forEach((post) => {
			delete post.user_id
		})
		console.log("found Post: ", res);
		result(null, res);
		return;
	  }
  
	  // not found Post with the id
	  result({ kind: "not_found" }, null);
	});
};

Post.findCommentedByUser = (userId, result) => {
	sql.query(`SELECT p.*, NULL as user_id, u.pseudo AS user, COUNT(DISTINCT c.id) AS comments, COUNT(DISTINCT f.id) AS favorites FROM posts p LEFT JOIN users u ON p.user_id = u.id LEFT JOIN comments c ON p.id = c.post_id LEFT JOIN favorites f ON p.id = f.post_id WHERE c.user_id = ${userId} AND p.report = 0 GROUP BY p.id ORDER BY p.id DESC`, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
  
	  if (res.length) {
		res.forEach((post) => {
			delete post.user_id
		})
		console.log("found Post: ", res);
		result(null, res);
		return;
	  }
  
	  // not found Post with the id
	  result({ kind: "not_found" }, null);
	});
};

Post.findUserFavorites = (userId, result) => {
	sql.query(`SELECT p.*, NULL as user_id, u.pseudo AS user, COUNT(DISTINCT c.id) AS comments, COUNT(DISTINCT f.id) AS favorites FROM posts p LEFT JOIN users u ON p.user_id = u.id LEFT JOIN comments c ON p.id = c.post_id LEFT JOIN favorites f ON p.id = f.post_id WHERE f.user_id = ${userId} AND p.report = 0 GROUP BY p.id ORDER BY p.id DESC`, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
  
	  if (res.length) {
		res.forEach((post) => {
			delete post.user_id
		})
		console.log("found Post: ", res);
		result(null, res);
		return;
	  }
  
	  // not found Post with the id
	  result({ kind: "not_found" }, null);
	});
};


Post.findMostRecent = (result) => {
	sql.query(`SELECT p.*, NULL as user_id, u.pseudo AS user, COUNT(DISTINCT c.id) AS comments, COUNT(DISTINCT f.id) AS favorites FROM posts p LEFT JOIN users u ON p.user_id = u.id LEFT JOIN comments c ON p.id = c.post_id LEFT JOIN favorites f ON p.id = f.post_id WHERE p.report = 0 GROUP BY p.id ORDER BY p.creation_date DESC LIMIT 6`, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
  
	  if (res.length) {
		res.forEach((post) => {
			delete post.user_id
		})
		console.log("found Post: ", res);
		result(null, res);
		return;
	  }
  
	  // not found Post with the id
	  result({ kind: "not_found" }, null);
	});
};

Post.findMostSeen = (result) => {
	sql.query(`SELECT p.*, NULL as user_id, u.pseudo AS user, COUNT(DISTINCT c.id) AS comments, COUNT(DISTINCT f.id) AS favorites FROM posts p LEFT JOIN users u ON p.user_id = u.id LEFT JOIN comments c ON p.id = c.post_id LEFT JOIN favorites f ON p.id = f.post_id WHERE p.report = 0 GROUP BY p.id ORDER BY p.views DESC, comments DESC LIMIT 6`, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
  
	  if (res.length) {
		res.forEach((post) => {
			delete post.user_id
		})
		console.log("found Post: ", res);
		result(null, res);
		return;
	  }
  
	  // not found Post with the id
	  result({ kind: "not_found" }, null);
	});
};
  
Post.findAll = (title, category, order, result) => {
	let query = "SELECT p.*, NULL as user_id, u.pseudo AS user, COUNT(DISTINCT c.id) AS comments, COUNT(DISTINCT f.id) AS favorites FROM posts p LEFT JOIN users u ON p.user_id = u.id LEFT JOIN comments c ON p.id = c.post_id LEFT JOIN favorites f ON p.id = f.post_id WHERE p.report = 0"

	if (title) {
		query += ` AND title LIKE '%${title}%'`;
	}
	if (category) {
		let categories =""
		if (category.length > 1) {
			categories = category.join("', '");
		}
		else{
			categories = category[0];
		}
		query += ` AND category IN ('${categories}')`;
	}

	query += ' GROUP BY p.id'
	
	if (order === "recent"){
		query += `  ORDER BY p.id DESC`
	}
	else if (order === "views"){
		query += ` ORDER BY p.views DESC`
	}
	else if (order === "comments"){
		query += ` ORDER BY COUNT(c.id) DESC`
	}

	console.log(query)
	sql.query(query, (err, res) => {
		if (err) {
			console.log("error: ", err);
			result(err,null);
			return;
		  }
		if (res.length > 0){
			res.forEach((post) => {
				delete post.user_id
			})
		}
		console.log("posts: ", res);
		result(null, res);
	});
};

Post.findAllCategories = (result) => {
	sql.query(`SELECT category FROM posts WHERE report = 0 GROUP BY category`, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
  
	  if (res.length) {
		console.log("found categories: ", res);
		result(null, res);
		return;
	  }
  
	  // not found
	  result({ kind: "not_found" }, null);
	});
};
  

module.exports = Post