const sql = require("./db.js");


// constructor
const User = function(user) {
  this.name = user.name;
  this.first_name = user.firstName;
  this.birth_date = user.birthDate;
  this.pseudo = user.pseudo;
  this.email = user.email;
  this.password = user.password;
  this.presentation = user.presentation;
  this.inscription_date = user.inscriptionDate;
  this.photo = user.photo;
};

User.create = (newUser, result) => {
	sql.query("INSERT INTO users SET ?", newUser, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
      console.log("create new user");
	  result(null, { id: res.insertId, ...newUser });
	});
};

User.modifyUserPassword = (id, password, result) => {
	if (id){
		let query = `UPDATE users SET password="${password}" WHERE id=${id}`
		sql.query(query, (err, res) => {
		if (err) {
			console.log("error: ", err);
			result(err, null);
			return;
		}
		console.log("Password modified");
		result(null, { message: "Password modified" });
		});
	}
};

User.modifyUserPhoto = (id, photo, result) => {
	if (id){
		let query = `UPDATE users SET photo="${photo}" WHERE id=${id}`
		sql.query(query, (err, res) => {
		if (err) {
			console.log("error: ", err);
			result(err, null);
			return;
		}
		console.log("Photo modified");
		result(null, { message: "Photo modified" });
		});
	}
};

User.modifyUserPresentation = (id, presentation, result) => {
	if (id){
		let query = `UPDATE users SET presentation="${presentation}" WHERE id=${id}`
		sql.query(query, (err, res) => {
		if (err) {
			console.log("error: ", err);
			result(err, null);
			return;
		}
		console.log("Presentation modified");
		result(null, { message: "Presentation modified" });
		});
	}
};

User.delete = (id, result) => {
	if (id){
		let query = `DELETE FROM users WHERE id = ${id}`
		sql.query(query, (err, res) => {
		if (err) {
			console.log("error: ", err);
			result(err, null);
			return;
		}
		
		console.log("Delete user");
		result(null, { message: "Utilisateur supprimé" });
		});
	}
};

User.findByEmail = (email, result) => {
	sql.query(`SELECT id, password FROM users WHERE email = "${email}"`, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
	  if (res.length) {
		console.log(res[0])
		result(null, res[0]);
		return;
	  }
	  // not found
	  result({ kind: "not_found" }, null);
	});
};

User.findByPseudo = (pseudo, userId, result) => {
	sql.query(`SELECT id, pseudo, presentation, photo FROM users WHERE pseudo = "${pseudo}"`, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }

	  if (res.length) {
		if (userId){
			if (userId === res[0].id){
				const userToSend = {...res[0], profileOwner : true}
				res[0] = {...userToSend}
			}
			else{
				const userToSend = {...res[0], profileOwner : false}
				res[0] = {...userToSend}
			}	
		}
		console.log(res[0])
		result(null, res[0]);
		return;
	  }

	  // not found Post with the id
	  result({ kind: "not_found" }, null);

	});
};

User.findById = (id, result) => {
	sql.query(`SELECT pseudo, presentation, photo FROM users WHERE id = ${id}`, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
	  if (res.length) {
		result(null, res[0]);
		return;
	  }
	  // not found
	  // result({ kind: "not_found" }, null);
	});
};
  
User.findByIdForPasswordVerification = (id, result) => {
	sql.query(`SELECT password FROM users WHERE id = ${id}`, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
	  if (res.length) {
		result(null, res[0]);
		return;
	  }
	  // not found
	  // result({ kind: "not_found" }, null);
	});
};


User.findOnlyPseudo = (pseudo, result) => {
	sql.query(`SELECT pseudo FROM users WHERE pseudo = "${pseudo}"`, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
  
	  if (res.length) {
		result(null, res[0]);
		return;
	  }
  
	  // not found
	 result(null, {pseudo:""});
	});
};



module.exports = User