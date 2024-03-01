const express = require('express')

const auth = require("../middleware/auth");
const messageCtrl = require("../controllers/message");


// Crée un routeur (routes vers "/api/message/...")
const router = express.Router()

// On enregistre nos routes sur le routeur
router.post('/new_message', auth, messageCtrl.createMessage);
router.post('/modify', auth, messageCtrl.modifyMessage);
router.post('/modify_seen', auth, messageCtrl.modifySeenMessages);
router.post('/delete', auth, messageCtrl.deleteMessage);
router.post('/get_conversations', auth, messageCtrl.getConversations);
// router.post('/get_messages', auth, messageCtrl.getMessagesByUser);
router.post('/get_messages_from_contact', auth, messageCtrl.getMessagesByContact);
router.post('/get_unseen', auth, messageCtrl.getNotSeenNumber);


// On exporte le routeur pour pouvoir l'enregistrer sur l'appli Express
module.exports = router