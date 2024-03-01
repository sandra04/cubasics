
const Message = require ("../models/message.model.js");
const Contact = require ("../models/contact.model.js");


exports.createMessage = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  if (req.body.content !== "" && req.body.content !==" "){
    Contact.findIsContact(req.auth.userId, req.body.pseudo, (err, data) => {
      if (err) {
        res.status(500).send({
          message: "Error retrieving the user"
          });
      }
      else if (data.length === 0){
        res.status(401).send({
          message: "Unauthorized"
          });
      }
      else{
        Message.findOtherUserId(req.body.pseudo, (err, dataUser) => {
          if (err) {
            res.status(500).send({
              message: "Error retrieving the user"
              });
          }
        
          else{
            // Create a message
            const message = new Message({
              content: req.body.content,
              image: req.body.image ? req.body.image : null,
              creationDate: req.body.creationDate,
              modificationDate: null,
              seen:false,
              userIdSender : req.auth.userId,
              userIdReceiver: dataUser[0].id
            });

            // Save message in the database
            Message.create(message, (err, data) => {
              if (err)
                res.status(500).send({
                  message:
                    err.message || "Some error occurred while creating the message."
                });
              else res.status(201).json(data);
            });
          }
        });
      }
    });
  }
};


exports.modifyMessage = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  const id = req.body.id;
  const content = req.body.content;
  const modificationDate = req.body.modificationDate;
  const image = req.body.image ? req.body.image : null;
  const userId = req.auth.userId

  if (req.body.content !== "" && req.body.content !==" "){
    Message.findById(id, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found message`
          });
        }
        else {
          res.status(500).send({
            message: "Error"
          });
        }
      } 
      else{
        if (data.user_id_sender !== userId){
          res.status(401).json({message: "Unauthorized"});
        }
        else{
          // Save modified message in the database
          Message.modify(id, content, image, modificationDate, (err, data) => {
            if (err)
              res.status(500).send({
                message:
                  err.message || "Some error occurred while modifying the message."
              });
            else res.status(200).json({message: "Message updated"});
          });
        }
      }
    });
  }
};


exports.modifySeenMessages = (req, res, next) => {
  
  const userId = req.auth.userId;
  const pseudo = req.body.pseudo
  
  Message.findOtherUserId(pseudo, (err, dataUser) => {
    if (err) {
      res.status(500).send({
        message: "Error retrieving the user"
        });
    }
    else{
      Message.findNotSeenByContact(userId, dataUser[0].id, (err, data) => {
        if (err){
          res.status(500).send({
              message:
              err.message || "Some error occurred while retrieving messages."
          });
        }
        if (data.length > 0){
          data.forEach((currentMessage) => {
            Message.modifySeenMessage(currentMessage.id, (err, data) => {
              if (err)
                res.status(500).send({
                  message:
                    err.message || "Some error occurred while modifying the message."
                });
              else res.status(200).json({message: "Message updated"});
            });
          });
        }
        res.status(200).json({message:"ok"});
      });
    }
  });
};


exports.deleteMessage = (req, res, next) => {
  
  const id = req.body.id;
  const userId = req.auth.userId;

  Message.findById(id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found message`
        });
      }
      else {
        res.status(500).send({
          message: "Error"
        });
      }
    } 
    else{
      if (data.user_id_sender !== userId){
        res.status(401).json({message: "Unauthorized"});
      }
      else{
        // Delete message from the database
        Message.delete(id, (err, data) => {
          if (err)
            res.status(500).send({
              message:
                err.message || "Some error occurred while erasing the message."
            });
          else res.status(200).json({message: "Message erased"});
        });
      }
    }
  });
};


/*exports.getMessagesByUser = (req, res, next) => {
  
  const userId = req.auth.userId;
  
  Message.findByUser(userId, (err, data) => {
    if (err){
      res.status(500).send({
          message:
          err.message || "Some error occurred while retrieving messages."
      });
    }
    console.log(data)
    res.status(200).json(data);
  });
};*/


exports.getConversations = (req, res, next) => {
  console.log("Waiting for fetch")
  const userId = req.auth.userId;
  
  Message.findAllConversations(userId, (err, data) => {
    if (err){
      res.status(500).send({
          message:
          err.message || "Some error occurred while retrieving messages."
      });
    }
    //console.log(data)
    res.status(200).json(data);
  });
};


exports.getMessagesByContact = (req, res, next) => {
  
  const userId = req.auth.userId;
  const pseudo = req.body.pseudo
  
  Message.findOtherUserId(pseudo, (err, dataUser) => {
    if (err) {
      res.status(500).send({
        message: "Error retrieving the user"
        });
    }
    else{
      Message.findMessagesByContact(userId, dataUser[0].id, (err, data) => {
        if (err){
          res.status(500).send({
              message:
              err.message || "Some error occurred while retrieving messages."
          });
        }
        //console.log(data)
        res.status(200).json(data);
      });
    }
  });
};


exports.getNotSeenNumber = (req, res, next) => {
  
  const userId = req.auth.userId;
  
  Message.findNotSeen(userId, (err, data) => {
    if (err){
      res.status(500).send({
          message:
          err.message || "Some error occurred while retrieving messages."
      });
    }
    console.log(data)
    res.status(200).json(data);
  });
};