const express = require('express')

// const multer = require("../middleware/multer-config");
const auth = require("../middleware/auth");
const verify = require("../middleware/verify");
const postCtrl = require("../controllers/post");


// Crée un routeur (enregistre les routes correspondant à "/api/post/...")
const router = express.Router()

// On enregistre nos routes sur le routeur, on les applique donc à "router" et non à "app" comme si on l'exécutait sur le fichier Express d'application directement
// Pour tout ce qui correspond à la route "/api/post", ça devient la racine de notre routeur (tous les éléments du routeur sont appliqués à ce début de route)

router.post('/create_new_post', auth, postCtrl.createPost);
router.post('/add_view', postCtrl.addViewPost)
router.post('/modify', auth, postCtrl.modifyPost)
router.post('/delete', auth, postCtrl.deletePost)
router.post('/get', postCtrl.getAllPosts);
router.post('/get_most_recent', postCtrl.getMostRecent);
router.post('/get_most_seen', postCtrl.getMostSeen);
router.post('/get_by_user', postCtrl.getPostsByUser);
router.post('/get_by_user_private', auth, postCtrl.getPostsByUserPrivate);
router.post('/get_commented_posts_by_user', auth, postCtrl.getCommentedPostsByUser)
router.post('/get_favorite_posts_by_user', auth, postCtrl.getFavoritePostsByUser)
router.post('/categories', postCtrl.getAllCategories);
router.post('/get_by_id', verify, postCtrl.getOnePost);



// On exporte le routeur pour pouvoir l'enregistrer sur l'appli Express
module.exports = router