const express = require('express')

const auth = require("../middleware/auth");
const verify = require("../middleware/verify");

const userCtrl = require("../controllers/user");


// Crée un routeur (enregistre les routes correspondant à "/api/user/...")
const router = express.Router()

// On enregistre nos routes sur le routeur
router.post('/signup', userCtrl.signup);
router.post("/login", userCtrl.login);
router.post("/modify_psd", auth, userCtrl.modifyPassword);
router.post("/modify_photo", auth, userCtrl.modifyPhoto);
router.post("/modify_presentation", auth, userCtrl.modifyPresentation);
router.post("/delete", auth, userCtrl.deleteUser);
router.post("/get", verify, userCtrl.getOneUser);
router.post("/get_private", auth, userCtrl.getOneUserPrivate);
router.post("/get_pseudo", userCtrl.searchingPseudo);


// On exporte le routeur pour pouvoir l'enregistrer sur l'appli Express
module.exports = router