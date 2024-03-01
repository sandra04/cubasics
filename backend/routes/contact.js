const express = require('express')

const auth = require("../middleware/auth");
const contactCtrl = require("../controllers/contact");


// Crée un routeur (routes vers "/api/contact/...")
const router = express.Router()

// On enregistre nos routes sur le routeur
router.post('/new_contact', auth, contactCtrl.createContact);
router.post('/delete', auth, contactCtrl.deleteContact);
router.post('/update', auth, contactCtrl.modifyContact);
router.post('/search_contact', auth, contactCtrl.searchContact);
router.post('/get_contacts', auth, contactCtrl.getUserContacts);
router.post('/get_contacts_waiting', auth, contactCtrl.getUserContactsToRespond);


// On exporte le routeur pour pouvoir l'enregistrer sur l'appli Express
module.exports = router