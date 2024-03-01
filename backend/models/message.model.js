const sql = require("../models/db.js");


// constructor
const Message = function(message) {
  this.content = message.content;
  this.image = message.image;
  this.creation_date = message.creationDate;
  this.modification_date = message.modificationDate;
  this.seen = message.seen;
  this.user_id_sender = message.userIdSender;
  this.user_id_receiver = message.userIdReceiver;
};

Message.create = (newMessage, result) => {
	sql.query("INSERT INTO messages SET ?", newMessage, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
  
	  // console.log("created new message);
	  result(null, { id: res.insertId, ...newMessage });
	});
};

Message.modify = (id, content, image, modificationDate, result) => {
  const myImage = image !== null ? JSON.stringify(image) : null;

  if (id){
		let query = `UPDATE messages SET content="${content}", image=${myImage}, modification_date="${modificationDate}" WHERE id=${id}`
		sql.query(query, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      
      console.log("Update message");
      result(null, { message: "Message updated" });
		});
	}
};

Message.modifySeenMessage = (id, result) => {
  if (id){
		let query = `UPDATE messages SET seen = 1 WHERE id=${id}`
		sql.query(query, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      
      console.log("Update message");
      result(null, { message: "Message updated" });
		});
	}
};

Message.delete = (id, result) => {
  if (id){
		let query = `DELETE FROM messages WHERE id=${id}`
		sql.query(query, (err, res) => {
		if (err) {
			console.log("error: ", err);
			result(err, null);
			return;
		}
		
		console.log("Delete message");
		result(null, { message: "Message supprimé" });
		});
	}
};

/*Message.findByUser = (userId, result) => {
  sql.query(`SELECT m.*, u.pseudo FROM messages m RIGHT JOIN users u ON (u.id = m.user_id_sender OR u.id = m.user_id_receiver) WHERE (m.user_id_sender = ${userId} OR m.user_id_receiver = ${userId}) AND u.id !=${userId}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err,null);
      return;
    }
      
    if (res.length){
			delete res.user_id_sender;
      delete res.user_id_receiver;
		}

    result(null, res);
    return;
  });
};*/

// SELECT u.pseudo, u.photo, MAX(m.creation_date) as creation_date, m.user_id_sender, m.user_id_receiver FROM messages m RIGHT JOIN users u ON (u.id = m.user_id_sender OR u.id = m.user_id_receiver) WHERE (m.user_id_sender = ${userId} OR m.user_id_receiver = ${userId}) AND u.id != ${userId} GROUP BY u.id ORDER BY m.creation_date DESC
Message.findAllConversations = (userId, result) => {
  sql.query(`SELECT u.pseudo, u.photo, m.creation_date, m.user_id_sender, m.user_id_receiver FROM messages m RIGHT JOIN users u ON (u.id = m.user_id_sender OR u.id = m.user_id_receiver) WHERE (m.user_id_sender = ${userId} OR m.user_id_receiver = ${userId}) AND u.id != ${userId} ORDER BY m.creation_date DESC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err,null);
      return;
    }

    let conversationList = []
    let conversations = []
    let duplicates = {}

    if (res.length > 0) {
      res.forEach((conversation) => {
          if (!duplicates[conversation.pseudo]) {
            conversationList.push(conversation)
            duplicates[conversation.pseudo] = true
          }
        })
      conversationList.forEach((conversation) => {
        if (userId === conversation.user_id_sender){
          const conversationToSend = {...conversation, isLastSender : true}
          delete conversationToSend.user_id_sender
          delete conversationToSend.user_id_receiver
          if (conversations.length === 0) {
            conversation = {...conversationToSend, isActive: true}
          }
          else{
            conversation = {...conversationToSend, isActive: false}
          }
          conversations.push(conversation)
        }
        else{
          const conversationToSend = {...conversation, isLastSender : false}
          delete conversationToSend.user_id_sender
          delete conversationToSend.user_id_receiver
          if (conversations.length === 0) {
            conversation = {...conversationToSend, isActive: true}
          }
          else{
            conversation = {...conversationToSend, isActive: false}
          }
          conversations.push(conversation)
        }	
      }) 
    }

    result(null, conversations);
    return;
  });
};


Message.findById = (id, result) => {
	
	sql.query(`SELECT id, user_id_sender FROM messages WHERE id = ${id}`, (err, res) => {
	  if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
	  }
  
	  if (res.length) {
      result(null, res[0]);
      return;
	  }
  
	  // not found Post with the id
	  result({ kind: "not_found" }, null);
	});
};


Message.findMessagesByContact = (userId, contactId, result) => {
  sql.query(`SELECT m.*, u.pseudo as user FROM messages m RIGHT JOIN users u ON (u.id = m.user_id_sender OR u.id = m.user_id_receiver) WHERE (m.user_id_sender = ${userId} OR m.user_id_receiver = ${userId}) AND (m.user_id_sender = ${contactId} OR m.user_id_receiver = ${contactId}) AND u.id !=${userId}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err,null);
      return;
    }
    
    let messages = []

    if (res.length){
      res.forEach((message) => {
			  if (userId === message.user_id_sender){
          const messageToSend = {...message, isSender : true}
          delete messageToSend.user_id_sender
          delete messageToSend.user_id_receiver
          message = {...messageToSend}
          messages.push(message)
        }
        else{
          const messageToSend = {...message, isSender : false}
          delete messageToSend.user_id_sender
          delete messageToSend.user_id_receiver
          message = {...messageToSend}
          messages.push(message)
        }	
      });
		}

    result(null, messages);
    return;
  });
};

Message.findNotSeenByContact = (userId, contactId, result) => {
  sql.query(`SELECT m.*, u.pseudo as user FROM messages m RIGHT JOIN users u ON (u.id = m.user_id_sender OR u.id = m.user_id_receiver) WHERE m.user_id_receiver = ${userId} AND m.user_id_sender = ${contactId} AND u.id !=${userId} AND m.seen = 0`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err,null);
      return;
    }

    if (res.length){
      res.forEach((message) => {
        delete message.user_id_sender
        delete message.user_id_receiver
      });
		}

    result(null, res);
    return;
  });
};


Message.findNotSeen = (userId, result) => {
  sql.query(`SELECT COUNT(id) as notSeen FROM messages WHERE user_id_receiver = ${userId} AND seen = 0`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err,null);
      return;
    }

    result(null, res);
    return;
  });
};


Message.findOtherUserId = (pseudo, result) => {
  let query = `SELECT u.id, u.pseudo FROM users u LEFT JOIN messages m ON u.id = m.user_id_sender OR u.id = m.user_id_receiver WHERE u.pseudo = "${pseudo}" GROUP BY u.id`;
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

  

module.exports = Message