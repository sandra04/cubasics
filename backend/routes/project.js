const express = require('express')

const auth = require("../middleware/auth");
const verify = require("../middleware/verify");
const projectCtrl = require("../controllers/project");


// Crée un routeur (routes vers "/api/project/...")
const router = express.Router()

// On enregistre nos routes sur le routeur
router.post('/create_new_project', auth, projectCtrl.createProject);
router.post('/add_view', projectCtrl.addViewProject);
router.post('/modify', auth, projectCtrl.modifyProject)
router.post('/delete', auth, projectCtrl.deleteProject)
router.post('/get', projectCtrl.getAllProjects);
router.post('/get_by_user', projectCtrl.getProjectsByUser);
router.post('/get_by_user_private', auth, projectCtrl.getProjectsByUserPrivate);
router.post('/get_by_id', verify, projectCtrl.getOneProject);
router.post('/profiles', projectCtrl.getAllSearchedProfiles);
router.post('/styles', projectCtrl.getAllStyles);



// On exporte le routeur pour pouvoir l'enregistrer sur l'appli Express
module.exports = router