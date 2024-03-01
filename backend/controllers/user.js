
const User = require ("../models/user.model.js");
const fs = require('fs');
const path = require('path');


// On importe le package "bcryp" qui permet de crypter des données
const bcrypt = require("bcrypt");

// On importe jsonwebtoken qui permet de chiffrer un token
const jwt = require("jsonwebtoken");



exports.signup = (req, res, next) => {
	if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.findByEmail(req.body.email, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        console.log("Email doesn't exist")
        User.findByPseudo(req.body.pseudo, null, (err, data) => {
          if (err) {
            if (err.kind === "not_found") {
              console.log("Pseudo doesn't exist")
              // On crypte le mdp, on récupère celui indiqué dans le corps de la requête
              // Le 2ème argument est le "salt" (le nombre de fois où on exécute l'algo de hashage)
              // 10 suffit à faire un cryptage sécurisé, plus on augment le chiffre, plus ça va mettre du temps à s'exécuter
              bcrypt.hash(req.body.password, 10)
                // On récupère le code crypté ("hash")
                .then(hash => {
                  // On crée un utilisateur avec ce code crypté
                  const user = new User({
                    name: req.body.name,
                    firstName: req.body.firstName,
                    birthDate: req.body.birthDate,
                    pseudo: req.body.pseudo,
                    email: req.body.email,
                    password: hash,
                    presentation: null,
                    inscriptionDate: req.body.inscriptionDate,
                    photo: req.body.photo
                  });
                  console.log(user)
                  // On enregistre l'utilisateur dans la BDD
                  User.create(user, (err, data) => {
                    if (err) {
                      res.status(400).json({message: err.message});
                    }
                    else res.status(201).json("New user created");
                  });
                })
                .catch(error => res.status(500).json({ error }));
            }
            else {
              res.status(500).send({
                message: "Error retrieving the pseudo"
              });
            }
          } else res.status(401);
        })
      }
      else {
        console.log("erreur")
        res.status(500).send({
          message: "Error retrieving the email"
        });
      }
    } else res.status(401);
  });
};


exports.login = (req, res, next) => {
  User.findByEmail(req.body.email, (err, data) => {
    // Erreur = erreur d'exécution de la requête dans la BDD
    if (err) {
      res.status(500).json({message: err.message });
    }
  
    else {
      if (data === null) {
        res.status(401).json({ message : "Paire identifiant/mdp incorrecte" });
      }
      // Sinon, l'utilisateur existe, on vérifie que le mdp est équivalent à celui enregistré
      else{
        // On compare les infos avec la méthode "compare()" de bcrypt
        // 1- Mdp indiqué par l'utilisateur / 2- Mdp de la BDD
        bcrypt.compare(req.body.password, data.password)
        .then(valid => {
        // On vérifie la valeur retournée : si "false", erreur d'authentification
          if(!valid) {
            res.status(401).json({ message: "Paire identifiant/mdp incorrecte" });
          }
          // Sinon, le mdp est correct
          else {
            // Notre json contient un objet qui contient les infos utiles pour authentifier les prochaines requêtes du client
        
            res.status(200).json({
              userId: data.id,
              // On utilise la méthode "sign()" du package jsonwebtoken pour chiffrer un nouveau token
              token: jwt.sign(
                { userId: data.id }, // id de l'utilisateur (données qu'on veut encoder) utilisé en tant que "payload" (données encodées dans le token)
                process.env.JWT_KEY, // clé secrète pour l'encodage
                { expiresIn: "24h" } // délai à partir duquel le token n'est plus valide
              )
            });
          }
        })
        .catch(error => {
          res.status(500).json({ error });
        });
      }
    }
  })
}


exports.modifyPassword = (req, res, next) => {

  User.findByIdForPasswordVerification(req.auth.userId, (err, data) => {
    // Erreur = erreur d'exécution de la requête dans la BDD
    if (err) {
      res.status(500).json({message: err.message });
    }
  
    else {
      if (data === null) {
        res.status(401).json({ message : "Paire identifiant/mdp incorrecte" });
      }
      // Sinon, l'utilisateur existe, on vérifie que le mdp est équivalent à celui enregistré
      else{
        // On compare les infos avec la méthode "compare()" de bcrypt
        // 1- Mdp indiqué par l'utilisateur / 2- Mdp de la BDD
        bcrypt.compare(req.body.password, data.password)
        .then(valid => {
        // On vérifie la valeur retournée : si "false", erreur d'authentification
          if(!valid) {
            res.status(401).json({ message: "Paire identifiant/mdp incorrecte" });
          }
          // Sinon, le mdp est correct
          else {
            // On crypte le mdp, on récupère celui indiqué dans le corps de la requête
            // Le 2ème argument est le "salt" (le nombre de fois où on exécute l'algo de hashage)
            // 10 suffit à faire un cryptage sécurisé, plus on augment le chiffre, plus ça va mettre du temps à s'exécuter
            bcrypt.hash(req.body.newPassword, 10)
              // On récupère le code crypté ("hash")
              .then(hash => {
                User.modifyUserPassword(req.auth.userId, hash, (err, data) => {
                  if (err) {
                    if (err.kind === "not_found") {
                      res.status(404).send({
                        message: `Not found`
                      });
                    } else {
                      res.status(500).send({
                        message: "Error retrieving the user"
                      });
                    }
                  } else{ res.status(200).json({message: "modifié"});}
                });
              })
              .catch(error => {
                res.status(500).send({
                  message: "Error modifying the password"
                });
              })
          }
        })
        .catch(error => {
          res.status(500).json({ error });
        });
      }
    }
  })
};


exports.modifyPhoto = (req, res, next) => {
  User.findById(req.auth.userId, async (err, userData) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found`
        });
      }
      else {
        res.status(500).send({
          message: "Error retrieving the user"
        });
      }
    }
    else {
      let photo = ""
      // Save base64 image to disk
      if (req.body.photo){
        try {
          // Decoding base-64 image
          // Source: http://stackoverflow.com/questions/20267939/nodejs-write-base64-image-file
          function decodeBase64Image(dataString) {
            const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          
            let response = {};
            if (matches.length !== 3){
              return new Error('Invalid input string');
            }
            response.type = matches[1];
            // Convert base64 to buffer => <Buffer ff d8 ff db 00 43 00 
            response.data = Buffer.from(matches[2], 'base64');
            return response;
          }
          const imageBuffer = decodeBase64Image(req.body.photo);
          // Regular expression for image type:
          // Extracts the "jpeg" from "image/jpeg"
          const imageTypeRegularExpression = /\/(.*?)$/;      
          // This variable is actually an array which has 5 values,
          // The [1] value is the real image extension
          const imageTypeDetected = imageBuffer.type.match(imageTypeRegularExpression);
          const extension = imageTypeDetected[1]
      
          if (extension === "jpg" || extension === "jpeg" || extension === "png") {
            const bufferToTestSize = Buffer.from(req.body.photo.substring(req.body.photo.indexOf(',') + 1));
            // Byte length : bufferToTestSize.length | MB : bufferToTestSize.length / 1e+6
            if (bufferToTestSize.length / 1e+6 <= 4) {
              const myPath = './images/users/';
              // Generate random string
              const crypto = require('crypto');
              const seed = crypto.randomBytes(20);
              const uniqueSHA1String = crypto
                .createHash('sha1')
                .update(seed)
                .digest('hex');
              const uniqueRandomImageName = 'image-' + uniqueSHA1String;
            
              const fullPath = '.' + myPath + uniqueRandomImageName + '.' + extension;
              const pathForDb = myPath + uniqueRandomImageName + '.' + extension;
      
              // Save decoded binary image to disk
              try {
                await new Promise((resolve, reject) => {
                  fs.writeFile(path.join(__dirname, fullPath), imageBuffer.data,
                    (err) => {
                      if (err) {
                        console.log("Test erreur : ", err);
                        reject("")
                      }
                      else {
                        console.log('DEBUG - feed:message: Image saved to disk :', fullPath);
                        photo = pathForDb;
                        resolve("")
                      }
                    });
                });
              }
              catch (error) {
                console.log('ERROR:', error);
              }
            }
          }
        }
        catch (error) {
          console.log('ERROR:', error);
        }
      }
    
      User.modifyUserPhoto(req.auth.userId, photo, async (err, data) => {
        if (err) {
          res.status(500).send({
            message: "Error retrieving the user"
          });
        }
        else {
          res.status(200).json({message: "Photo modifiée"});
          // Delete previous image
          if (userData.photo){
            try {
              const currentPath = '.' + userData.photo;
              await fs.unlinkSync(path.join(__dirname, currentPath))
              //file removed
            }
            catch(err) {
              if (err.code !== "ENOENT"){
                console.log(err.message)
              }
            }
          }
        }
      });
    }
  })
};


exports.modifyPresentation = (req, res, next) => {
  User.modifyUserPresentation(req.auth.userId, req.body.presentation, (err, data) => {
    if (err) {
      res.status(500).send({
        message: "Error retrieving the user"
      });
    }
    else res.status(200).json({message: "Présentation modifiée"});
  });
};


exports.deleteUser = (req, res, next) => {

  User.delete(req.auth.userId, (err, data) => {
    if (err)
    res.status(500).send({
      message:
        err.message || "Some error occurred while erasing the user."
    });
    else res.status(200).json({message: "User erased"});
  });
};


exports.getOneUserPrivate = (req, res, next) => {
  User.findById(req.auth.userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving the user"
        });
      }
    } else res.status(200).json(data);
  });
};


exports.getOneUser = (req, res, next) => {

  const pseudo = req.body.pseudo;
  const userId = req.ver.userId;

  User.findByPseudo(pseudo, userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving the user"
        });
      }
    } else {
      delete data.id
      res.status(200).json(data);
    }
  });
};


exports.searchingPseudo = (req, res, next) => {
  User.findOnlyPseudo(req.body.pseudo, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving the user"
        });
      }
    } else res.status(200).json(data);
  });
}

/*exports.searchingEmailIsUnique = (req, res, next) => {
  User.findByEmail(req.body.email, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(200)
      } else {
        res.status(500).send({
          message: "Error retrieving the email"
        });
      }
    } else res.status(401);
  });
};*/