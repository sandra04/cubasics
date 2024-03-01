const http = require('http');
const app = require('./app');

// Renvoie un port valide (qu'il s'agisse d'un entier ou d'une string)
const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
// Serveur configuré pour écouter variable d'environnement du port ou port 3000
// On regarde si notre plateforme de déploiement nous propose un port par défaut à utiliser
// sinon on lui dit d'utiliser le port 3 000 (en général le port par défaut utilisé), il sert notamment pour la plateforme de développement
const port = normalizePort(process.env.PORT || '3000');
// On dit à notre appli Express sur quel port elle va tourner
app.set('port', port);

// Recherche les erreurs et les gère. Elle est ensuite enregistrée dans le serveur
const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// crée un serveur à partir de la méthode "createServer" du package "http".
// Il contient une fonction, exécutée à chaque appel effectué vers le serveur. La fonction reçoit une requête et une réponse en arguments
// On passe notre appli Express en argument à notre serveur, car il s'agit d'une fonction qui va recevoir la requête et la réponse et les modifier
const server = http.createServer(app);

// Enregistre les erreurs dans le serveur
server.on('error', errorHandler);
// Envoie dans la console le port ou canal nommé où s'exécute notre serveur
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

// Ecoute le port ou canal sur lequel le serveur s'exécute
server.listen(port);