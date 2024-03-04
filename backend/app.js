// Appli Express
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config()

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



// On exporte notre appli Express pour pouvoir y faire appel depuis d'autres fichiers (notamment notre serveur Node)
module.exports = app;
