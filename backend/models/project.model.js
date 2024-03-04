const sql = require("./db.js");


// constructor
const Project = function(project) {
  this.title = project.title;
  this.content = project.content;
  this.searched_profiles = project.searchedProfiles;
  this.style = project.style;
  this.creation_date = project.creationDate;
  this.modification_date = project.modificationDate;
  this.image = project.image;
  this.audio = project.audio;
  this.views = project.views;
  this.last_view_date = project.lastViewDate;
  this.report = project.report;
  this.user_id = project.userId;
};


Project.create = (newProject, result) => {
	sql.query("INSERT INTO projects SET ?", newProject, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
  
	  result(null, { id: res.insertId, ...newProject });
	});
};


Project.modify = (id, title, content, searchedProfiles, style, modificationDate, image, audio, result) => {
	const myProfiles = JSON.stringify(searchedProfiles);
	const myStyle = JSON.stringify(style);
	const myImage = image !== null ? JSON.stringify(image) : null;
	const myAudio = audio !== null ? JSON.stringify(audio) : null;
	
	if (id){
		let query = `UPDATE projects SET title="${title}", content="${content}", searched_profiles='${myProfiles}', style='${myStyle}', modification_date="${modificationDate}", image=${myImage}, audio=${myAudio} WHERE id=${id}`
		sql.query(query, (err, res) => {

			if (err) {
				console.log("error: ", err);
				result(err, null);
				return;
			}
			result(null, { message: "Projet modifié" });
    });
  }
};


Project.modifyViews = (id, views, lastViewDate, result) => {
	if (id){
		let query = `UPDATE projects SET views=${views}, last_view_date="${lastViewDate}" WHERE id=${id}`
		sql.query(query, (err, res) => {
		if (err) {
			console.log("error: ", err);
			result(err, null);
			return;
		}
		result(null, { message: "New view added" });
		});
	}
};


Project.delete = (id, result) => {
	if (id){
    let query = `DELETE FROM projects WHERE id = ${id}`
    sql.query(query, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      result(null, { message: "Projet supprimé" });
    });
  }
};


Project.findById = (id, userId, result) => {
	sql.query(`SELECT p.*, u.pseudo AS user FROM projects p LEFT JOIN users u ON p.user_id = u.id WHERE p.id = ${id} AND p.report = 0 GROUP BY p.id`, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
  
	  if (res.length) {
		if (userId){
			if (userId === res[0].user_id){
				const projectToSend = {...res[0], isAuthor : true}
				res[0] = {...projectToSend}
			}
			else{
				const projectToSend = {...res[0], isAuthor : false}
				res[0] = {...projectToSend}
			}	
		}

		result(null, res[0]);
		return;
	  }
  
	  // not found project with the id
	  result({ kind: "not_found" }, null);
	});
};

Project.findByUserPrivate = (userId, result) => {
	sql.query(`SELECT p.*, NULL as user_id, u.pseudo AS user FROM projects p LEFT JOIN users u ON p.user_id = u.id WHERE p.user_id = ${userId} AND p.report = 0 GROUP BY p.id ORDER BY p.id DESC`, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
  
	  if (res.length) {
		res.forEach((project) => {
			delete project.user_id
		})
		result(null, res);
		return;
	  }

	  // not found Post with the id
	  result({ kind: "not_found" }, null);
	});
  };

  Project.findByUser = (pseudo, result) => {
	sql.query(`SELECT p.*, NULL as user_id, u.pseudo AS user FROM projects p LEFT JOIN users u ON p.user_id = u.id WHERE u.pseudo = "${pseudo}" AND p.report = 0 GROUP BY p.id ORDER BY p.id DESC`, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
  
	  if (res.length) {
		res.forEach((project) => {
			delete project.user_id
		})
		result(null, res);
		return;
	  }
  
	  // not found Post with the id
	  result({ kind: "not_found" }, null);
	});
  };

Project.findAll = (title, searchedProfiles, style, order, result) => {
	let query = `SELECT p.*, NULL as user_id, u.pseudo AS user FROM projects p LEFT JOIN users u ON p.user_id = u.id WHERE p.report = 0`

	if (title) {
		query += ` AND title LIKE '%${title}%'`;
	}
	if (searchedProfiles) {
		if (searchedProfiles.length === 1){
			query += ` AND searched_profiles LIKE '%${searchedProfiles[0]}%'`;
		}
		else{
			for (let i=0 ; i < searchedProfiles.length ; i++){
				if (i === 0){
					query += ` AND (searched_profiles LIKE '%${searchedProfiles[i]}%'`;
				}
				else if (i === searchedProfiles.length - 1){
					query += ` OR searched_profiles LIKE '%${searchedProfiles[i]}%')`;
				}
				else{
					query += ` OR searched_profiles LIKE '%${searchedProfiles[i]}%'`
				}
			}
		}	
	}
	if (style) {
		if (style.length === 1){
			query += ` AND style LIKE '%${style[0]}%'`;
		}
		else{
			for (let i=0 ; i < style.length ; i++){
				if (i === 0){
					query += ` AND (style LIKE '%${style[i]}%'`;
				}
				else if (i === style.length - 1){
					query += ` OR style LIKE '%${style[i]}%')`;
				}
				else{
					query += ` OR style LIKE '%${style[i]}%'`
				}
			}
		}
	}

	query += ' GROUP BY p.id'
	
	if (order === "recent"){
		query += `  ORDER BY p.id DESC`
	}
	else if (order === "views"){
		query += ` ORDER BY p.views DESC`
	}

	sql.query(query, (err, res) => {
		if (err) {
			console.log("error: ", err);
			result(err,null);
			return;
		}

		if (res.length > 0){
			res.forEach((project) => {
				delete project.user_id
			})
		}
	  
		result(null, res);

	});
}; 


Project.findAllSearchedProfiles = (result) => {
	sql.query(`SELECT searched_profiles FROM projects WHERE report = 0 GROUP BY searched_profiles`, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
  
	  if (res.length) {
		let profiles = []
  		let duplicates = {}

  		res.forEach((project) => {
    		JSON.parse(project.searched_profiles).forEach((currentProfile) => {
      			if (!duplicates[currentProfile]) {
        			profiles.push(currentProfile)
        			duplicates[currentProfile] = true
      			}
    		})
		})
		result(null, profiles);
		return;
	  }
  
	  // not found
	  result({ kind: "not_found" }, null);
	});
};


Project.findAllStyles = (result) => {
	sql.query(`SELECT style FROM projects WHERE report = 0 GROUP BY style`, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
  
	  if (res.length) {
		let styles = []
  		let duplicates = {}

  		res.forEach((project) => {
    		JSON.parse(project.style).forEach((currentStyle) => {
      			if (!duplicates[currentStyle]) {
        			styles.push(currentStyle)
        			duplicates[currentStyle] = true
      			}
    		})
		})
		result(null, styles);
		return;
	  }
  
	  // not found
	  result({ kind: "not_found" }, null);
	});
};
  

module.exports = Project