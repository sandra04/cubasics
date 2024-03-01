const express = require('express')

const auth = require("../middleware/auth");
const imageCtrl = require("../controllers/image");


// Crée un routeur (routes vers "/api/message/...")
const router = express.Router()


// On enregistre nos routes sur le routeur
router.get('/posts/:image', imageCtrl.getPostImage);
router.get('/commentaires/:image', imageCtrl.getCommentImage);
router.get('/projets/:image', imageCtrl.getProjectImage);
router.get('/users/:image', imageCtrl.getUserImage);
// router.get('/messages/:image', auth, imageCtrl.get_message_image);


// On exporte le routeur pour pouvoir l'enregistrer sur l'appli Express
module.exports = router