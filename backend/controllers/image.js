const fs = require('fs');
const path = require('path');
const { createReadStream } = require("fs");
const stream = require('stream')


exports.getPostImage = (req, res, next) => {
    // Création d'un readable et on pointe vers un fichier qu'on veut rendre streamable    
    const readStream = createReadStream(path.join(__dirname, `../images/posts/${req.params["image"]}`));

    const ps = new stream.PassThrough() 
    stream.pipeline(
        readStream,
        ps,
        // stream error handling
        (err) => {
            if (err) {
                console.log(err.message) // No such file or any other kind of error
                return res.sendStatus(400); 
            }
        }
    )
    ps.pipe(res)

}


exports.getProjectImage = (req, res, next) => {
    // Création d'un readable et on pointe vers un fichier qu'on veut rendre streamable    
    const readStream = createReadStream(path.join(__dirname, `../images/projects/${req.params["image"]}`));

    const ps = new stream.PassThrough() 
    stream.pipeline(
        readStream,
        ps,
        // stream error handling
        (err) => {
            if (err) {
                console.log(err.message) // No such file or any other kind of error
                return res.sendStatus(400); 
            }
        }
    )
    ps.pipe(res)

}


exports.getCommentImage = (req, res, next) => {
    // Création d'un readable et on pointe vers un fichier qu'on veut rendre streamable    
    const readStream = createReadStream(path.join(__dirname, `../images/comments/${req.params["image"]}`));

    const ps = new stream.PassThrough() 
    stream.pipeline(
        readStream,
        ps,
        // stream error handling
        (err) => {
            if (err) {
                console.log(err.message) // No such file or any other kind of error
                return res.sendStatus(400); 
            }
        }
    )
    ps.pipe(res)

}


exports.getUserImage = (req, res, next) => {
    // Création d'un readable et on pointe vers un fichier qu'on veut rendre streamable    
    const readStream = createReadStream(path.join(__dirname, `../images/users/${req.params["image"]}`));

    const ps = new stream.PassThrough() 
    stream.pipeline(
        readStream,
        ps,
        // stream error handling
        (err) => {
            if (err) {
                console.log(err.message) // No such file or any other kind of error
                return res.sendStatus(400); 
            }
        }
    )
    ps.pipe(res)

}


exports.getMessageImage = (req, res, next) => {
    // Création d'un readable et on pointe vers un fichier qu'on veut rendre streamable    
    const readStream = createReadStream(path.join(__dirname, `../images/messages/${req.params["image"]}`));

    const ps = new stream.PassThrough() 
    stream.pipeline(
        readStream,
        ps,
        // stream error handling
        (err) => {
            if (err) {
                console.log(err.message) // No such file or any other kind of error
                return res.sendStatus(400); 
            }
        }
    )
    ps.pipe(res)

}

    /***********Méthode 2 ******************/
 
    /*// Buffer image
    const buffer = bufferFile(`../images/posts/${req.params["image"]}`);

    function bufferFile(relPath) {
        
        return fs.readFileSync(path.join(__dirname, relPath), (err, data) => {
            if (!err) {
                console.log(data)
            }
            else {
                console.log(err.message);
                res.status(500).send({
                    message: "Error while retrieving image"
                });
            }
        });
    }

    console.log(buffer)
    res.status(200).json(buffer);*/