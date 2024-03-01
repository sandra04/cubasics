// Appli Express
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config()

// const path = require('path');

const postRouter = require('./routes/post')
const projectRouter = require('./routes/project')
const commentRouter = require('./routes/comment')
const favoriteRouter = require('./routes/favorite')
const userRouter = require('./routes/user')
const messageRouter = require('./routes/message')
const contactRouter = require('./routes/contact')
const imageRouter = require('./routes/image')


// Méthode express() permet de créer l'appli Express
const app = express();



app.use(cors());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({limit: '4mb', extended: true}));

// Pour accéder au corps d'une requête POST :
// Intercepte toutes les requêtes qui ont un content-type de type json (application/json) et le met à disposition sur l'objet requete grâce à req.body
// Forme plus ancienne de ce middleware : body-parser();
app.use(express.json({ limit: '4mb' })); // gestion taille max fichier possible dans les parenthèses



// Headers sur l'objet réponse pour permettre de communiquer avec la partie front (contourne l'interdiction par défaut du CORS) => partie à mettre juste avant l'API
// Ne prend pas d'adresse en premier argument, afin de s'appliquer à toutes les routes. Permettra à toutes les demandes de toutes les origines d'accéder à l'API.
app.use((req, res, next) => {
	// Autoriser l'accès à l'API depuis n'importe quelle origine
	res.setHeader('Access-Control-Allow-Origin', '*');
	// Autoriser les requêtes envoyées vers l'API avec ces headers
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
	// Autoriser les requêtes avec ces méthodes
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
	next();
});


/*const db = require("./models");
db.sequelize.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });*/



app.get("/", (req, res) => {
	res.json({ message: "Bienvenue sur l'API de Cubasics !" });
});

// On enregistre notre routeur sur l'appli Express (quand il y aura des requêtes sur la route "/api/post[/...]", on va appliquer ce qui est indiqué dans le fichier du routeur)
app.use('/api/post', postRouter)
app.use('/api/project', projectRouter)
app.use('/api/comment', commentRouter)
app.use('/api/favorite', favoriteRouter)
app.use('/api/user', userRouter)
app.use('/api/message', messageRouter)
app.use('/api/contact', contactRouter)
app.use('/api/images', imageRouter)

// On utilise le middleware "static" fourni par Express pour servir des fichiers statiques
// On gère en statique nos ressources images (dans un sous-répertoire de notre répertoire de base "__dirname")
// path = chemin absolu du répertoire qu'on veut servir
// On indique donc qu'à chaque requête sur la route "/images", on agit sur l'image concernée en statique avec le dossier "images"
// app.use("/images", express.static(path.join(__dirname, "images")));


/* Exemple de Middleware
// Permet à l'appli Express de répondre lorsqu'une requête est reçue par le serveur
app.use((req, res, next) => {
	// Envoie une réponse en json
	res.json({ message: 'Votre requête a bien été reçue !' });
	// res.status(201); ajouterait un code d'état à la réponse
	// La fonction permet de passer la requête au middleware suivant s'il y a d'autres middlewares après celui-ci dans le code de l'appli
	next();
});*/


/* Gestion erreurs
// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}

	// render the error page
	res.status(err.status || 500)
	res.render('error')
})
*/


/* If you want to  drop existing tables and re-sync database
db.sequelize.sync({ force: true }).then(() => {
	console.log("Drop and re-sync db.");
}); */

// On exporte notre appli Express pour pouvoir y faire appel depuis d'autres fichiers (notamment notre serveur Node)
module.exports = app;
