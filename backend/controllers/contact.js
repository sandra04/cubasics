
const Contact = require ("../models/contact.model.js");


exports.createContact = (req, res, next) => {
  if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
  }
  const userId = req.auth.userId;
  const pseudo = req.body.pseudo;

  
  Contact.findHasAsked(userId, pseudo, (err, data) => {
      if (err) {
        res.status(500).send({
          message: "Error retrieving the user"
          });
      }
      else if (data.length > 0){
        res.status(200).json({"isContact" : true});
      }
      else{

        Contact.findOtherUserId(pseudo, (err, dataUser) => {
          if (err) {
            res.status(500).send({
              message: "Error retrieving the user"
              });
          }
          else{
            // Create a contact
            const contact = new Contact({
              userIdAsking : userId,
              userIdAnswering : dataUser[0].id,
              contactStatus : "waiting for answer",
              acceptationDate : null
          });

          // Save Contact in the database
          Contact.create(contact, (err, data) => {
            if (err){
              res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the contact."
              });
            }
            else {
              console.log("added")
              res.status(201).json({message: "New contact added"});
            }
          });
        }
      });
    }
  });
}


exports.modifyContact = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  const id = req.auth.userId;
  const pseudo = req.body.pseudo;
  const contactStatus = "authorized";
  const acceptationDate = req.body.acceptationDate;
  
  Contact.findHasAsked(id, pseudo, (err, data) => {
    if (err) {
      res.status(500).send({
        message: "Error retrieving the user"
        });
    }
    else if (data.length > 0){
      Contact.findOtherUserId(pseudo, (err, dataUser) => {
        if (err) {
          res.status(500).send({
            message: "Error retrieving the user"
            });
        }
        else{
          // Save modified post in the database
          Contact.modifyStatus(id, dataUser[0].id, contactStatus, acceptationDate, (err, data) => {
            if (err)
              res.status(500).send({
                message:
                  err.message || "Some error occurred while modifying the contact."
              });
            else res.status(200).json({message: "Contact updated"});
          });
        }
      });
    }
  });
};


exports.deleteContact = (req, res, next) => {
  const userId = req.auth.userId;
  const pseudo = req.body.pseudo;
  //const contactId = req.body.contactId
  
  Contact.findHasAsked(userId, pseudo, (err, data) => {
    if (err) {
      res.status(500).send({
        message: "Error retrieving the user"
        });
    }
    else if (data.length > 0){
      Contact.findOtherUserId(pseudo, (err, dataUser) => {
        if (err) {
          res.status(500).send({
            message: "Error retrieving the user"
            });
        }
        else{
          Contact.delete(userId, dataUser[0].id, (err, data) => {
            if (err)
            res.status(500).send({
              message:
                err.message || "Some error occurred while erasing the contact."
            });
            else res.status(200).json({message: "Contact erased"});
          });
        }
      });
    }
    else{
      res.status(404).send({message: "Contact not found"})
    }
  });
};


exports.getUserContacts = (req, res, next) => {
    const userId = req.auth.userId;
    // const contactStatus = req.body.contactStatus

    Contact.findUserContacts(userId, (err, data) => {
        if (err){
            res.status(500).send({
                message:
                err.message || "Some error occurred while retrieving contacts."
            });
        }
        console.log(data)
        res.status(200).json(data);
  });
}


exports.getUserContactsToRespond = (req, res, next) => {
  const userId = req.auth.userId;

  Contact.findContactsToRespond(userId, (err, data) => {
      if (err){
          res.status(500).send({
              message:
              err.message || "Some error occurred while retrieving contacts."
          });
      }
      console.log("waiting : ", data)
      res.status(200).json(data);
});
}


exports.searchContact = (req, res, next) => {
    const userId = req.auth.userId;
    const pseudo = req.body.pseudo;

    Contact.findIsContact(userId, pseudo, (err, data) => {
        if (err) {
          res.status(500).send({
            message: "Error retrieving the user"
            });
        }
        else if (data.length > 0){
            res.status(200).json({"isContact" : true});
        }
        else{
            res.status(200).json({"isContact" : false});
        }
    });
};