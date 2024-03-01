const express = require('express')

const auth = require("../middleware/auth");
const verify = require("../middleware/verify");
const commentCtrl = require("../controllers/comment");


// Crée un routeur (routes vers "/api/comment/...")
const router = express.Router()

// On enregistre nos routes sur le routeur
router.post('/create_new_comment', auth, commentCtrl.createComment);
router.post('/modify', auth, commentCtrl.modifyComment)
router.post('/delete', auth, commentCtrl.deleteComment)
router.post('/get_by_post', verify, commentCtrl.getCommentsByPost)


// On exporte le routeur pour pouvoir l'enregistrer sur l'appli Express
module.exports = router