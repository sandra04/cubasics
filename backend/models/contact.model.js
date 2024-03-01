const sql = require("../models/db.js");


// constructor
const Contact = function(contact) {
  this.user_id_asking = contact.userIdAsking;
  this.user_id_answering = contact.userIdAnswering;
  this.contact_status = contact.contactStatus;
  this.acceptation_date = contact.acceptationDate;
};

Contact.create = (newContact, result) => {
	sql.query("INSERT INTO contacts SET ?", newContact, (err, res) => {
	  if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
	  }
  
	  console.log("New friend request created");
	  result(null, { id: res.insertId, ...newContact });
	});
};

Contact.modifyStatus = (id, contactId, contactStatus, acceptationDate, result) => {
  if (id && contactId && contactStatus){
		let query = `UPDATE contacts SET contact_status="${contactStatus}", acceptation_date="${acceptationDate}" WHERE user_id_answering=${id} AND user_id_asking=${contactId}`
		sql.query(query, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      
      console.log("Update contact");
      result(null, { message: "Contact updated" });
		});
	}
};

Contact.delete = (id, contactId, result) => {
  if (id && contactId){
		let query = `DELETE FROM contacts WHERE (user_id_asking=${id} OR user_id_answering=${id}) AND (user_id_asking=${contactId} OR user_id_answering=${contactId})`
		sql.query(query, (err, res) => {
		if (err) {
			console.log("error: ", err);
			result(err, null);
			return;
		}
		
		console.log("Delete contact");
		result(null, { message: "Contact supprimé" });
		});
	}
};

// Contact.findUserContacts = (user_id, contact_status, result) => {
Contact.findUserContacts = (userId, result) => {
  let query = `SELECT c.*, u.pseudo FROM contacts c RIGHT JOIN users u ON (u.id = c.user_id_asking OR u.id = c.user_id_answering) WHERE (c.user_id_asking=${userId} OR c.user_id_answering=${userId}) AND c.contact_status="authorized" AND u.id !=${userId}`;
  //let query = `SELECT * FROM contacts WHERE (user_id_asking=${userId} OR user_id_answering=${userId}) AND contact_status="authorized"`;
  /*if (contact_status){
    query += ` AND contact_status="authorized"`
  }*/
  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err,null);
      return;
    }

    if (res.length){
			delete res.user_id_asking;
      delete res.user_id_answering;
		}
    
    result(null, res);
    return;

  });
};


Contact.findIsContact = (id, pseudo, result) => {
  //let query = `SELECT * FROM contacts WHERE (user_id_asking=${id} OR user_id_answering=${id}) AND (user_id_asking=${contact_id} OR user_id_answering=${contact_id}) AND contact_status="authorized"`
  let query = `SELECT c.id, c.acceptation_date, u.pseudo FROM contacts c RIGHT JOIN users u ON u.id = c.user_id_asking OR u.id = c.user_id_answering WHERE (c.user_id_asking = ${id} OR c.user_id_answering = ${id}) AND u.pseudo = "${pseudo}" AND c.contact_status = "authorized" GROUP BY c.id`
  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    result(null, res);
    return;
  });
};

Contact.findHasAsked = (id, pseudo, result) => {
  let query = `SELECT c.id, c.acceptation_date, u.pseudo FROM contacts c RIGHT JOIN users u ON u.id = c.user_id_asking OR u.id = c.user_id_answering WHERE (c.user_id_asking = ${id} OR c.user_id_answering = ${id}) AND u.pseudo = "${pseudo}" GROUP BY c.id`
  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    result(null, res);
    return;
  });
};

Contact.findContactsToRespond = (userId, result) => {
  let query = `SELECT c.*, u.pseudo FROM contacts c RIGHT JOIN users u ON (u.id = c.user_id_asking OR u.id = c.user_id_answering) WHERE c.user_id_answering=${userId} AND c.contact_status="waiting for answer" AND u.id !=${userId}`;

  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err,null);
      return;
    }

    if (res.length){
			delete res.user_id_asking;
      delete res.user_id_answering;
		}
    
    result(null, res);
    return;

  });
};

Contact.findOtherUserId = (pseudo, result) => {
  let query = `SELECT u.id, u.pseudo FROM users u LEFT JOIN contacts c ON u.id = c.user_id_asking OR u.id = c.user_id_answering WHERE u.pseudo = "${pseudo}" GROUP BY u.id`;
  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
 
    result(null, res);
    return;
  });
};


module.exports = Contact