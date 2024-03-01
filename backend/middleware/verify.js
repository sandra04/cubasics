const jwt = require("jsonwebtoken");

// Vérifie le token reçu depuis le front
module.exports = (req, res, next) => {
	try {
		// On récupère le token (on va récupérer la partie voulue du header de la requête et le spliter en un tableau
		// Il contient "Bearer [token], on veut donc séparer autour du " " et récupérer le 2ème élément (le token)
		const token = req.headers.authorization.split(" ")[1];
		// On décode le token avec la méthode "verify()" de jsonwebtoken (prend en arguments le token, puis la clé secrète)
		// En cas d'erreur, ce sera bien pris en compte par le catch qui dira que le token est invalide
		const decodedToken = jwt.verify(token, process.env.JWT_KEY);
		
		// ?? if (decodedToken.exp > Date.now() / 1000) {
		// On récupère l'id de l'utilisateur dans notre token décodé
		const userId = decodedToken.userId;
		// On ajoute cette valeur à l'objet request pour que nos différentes routes puissent l'exploiter
		// (les routes qui sont à protéger car actions gérées par un utilisateur en particulier)
		req.ver = {
			userId: userId
		};
	
		// ?? }
		next();
	}
	catch(error) {
		req.ver = {
			userId: null
		};
		next()
	}
};