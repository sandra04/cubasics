const express = require('express')

const auth = require("../middleware/auth");
const favoriteCtrl = require("../controllers/favorite");


// Crée un routeur (routes vers "/api/favorite/...")
const router = express.Router()

// On enregistre nos routes sur le routeur
router.post('/add', auth, favoriteCtrl.createFavorite);
router.post('/get', auth, favoriteCtrl.postIsFavorite);
router.post('/delete', auth, favoriteCtrl.deleteFavorite);



// On exporte le routeur pour pouvoir l'enregistrer sur l'appli Express
module.exports = router