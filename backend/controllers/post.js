
const Post = require ("../models/post.model.js");
const fs = require('fs');
const path = require('path');



exports.createPost = async (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  let images = [];

  const postToDatabase = () => {

    // Create a post
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      creationDate: req.body.creationDate,
      modificationDate: null,
      image: images.length > 0 ? JSON.stringify(images) : null,
      audio: req.body.audio ? req.body.audio : null,
      views: 0,
      lastViewDate: null,
      report: false,
      userId: req.auth.userId
    });

    // Save post in the database
    Post.create(post, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the post."
        });
      else res.status(201).json({message: "New post created"})
    });
  };

  if (req.body.image) {
    let i = 0;

      for (let currentImage of req.body.image) {
        const base64Data = currentImage
      
        // Save base64 image to disk
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
          const imageBuffer = decodeBase64Image(base64Data);
          // Regular expression for image type:
          // Extracts the "jpeg" from "image/jpeg"
          const imageTypeRegularExpression = /\/(.*?)$/;      
          // This variable is actually an array which has 5 values,
          // The [1] value is the real image extension
          const imageTypeDetected = imageBuffer.type.match(imageTypeRegularExpression);
          const extension = imageTypeDetected[1]

          if (extension === "jpg" || extension === "jpeg" || extension === "png") {
            const bufferToTestSize = Buffer.from(base64Data.substring(base64Data.indexOf(',') + 1));
            // Byte length : bufferToTestSize.length | MB : bufferToTestSize.length / 1e+6
            if (bufferToTestSize.length / 1e+6 <= 4) {
              const myPath = './images/posts/';
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
                        reject("")
                      }
                      else {
                        images.push(pathForDb);
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
        i++;
      }

    if (i === req.body.image.length){
      postToDatabase()
    }  
  }
  else{
    postToDatabase()
  }
};


exports.modifyPost = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  const id = req.body.id;
  const title = req.body.title;
  const content = req.body.content;
  const category = req.body.category;
  const modificationDate = req.body.modificationDate;
  const userId = req.auth.userId;


  Post.findById(id, userId, async (err, dataOldPost) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found post`
        });
      } else {
        res.status(500).send({
          message: "Error"
        });
      }
    } 
    else{
      if (dataOldPost.user_id !== userId){
        res.status(401).json({message: "Unauthorized"});
      }
      else{   
       
        let images = [];
        
        const postToDatabase = () => {
  
          const image = req.body.newImage || req.body.oldImage ? [...req.body.oldImage, ...images] : null;
          const audio = req.body.audio ? req.body.audio : null;
          
          // Save modified post in the database

          Post.modify(id, title, content, category, modificationDate, image, audio, userId, (err, data) => {
            if (err) {
              res.status(500).send({
                message:
                  err.message || "Some error occurred while modifying the post."
              });
            }

            else {
              res.status(200).json({message: "Post modified"})
              
              // Delete previous images not kept
              const oldPostImage = JSON.parse(dataOldPost.image)
              
              if (oldPostImage && oldPostImage.length > 0){
                const imageToDelete = oldPostImage.filter((image) => !(req.body.oldImage.includes(image)))
              
                if (imageToDelete.length > 0){
                  imageToDelete.forEach(async (imagePath) => {
                    try {
                      const currentPath = '.' + imagePath;
                      await fs.unlinkSync(path.join(__dirname, currentPath))
                      //file removed
                    }
                    catch(err) {
                      if (err.code !== "ENOENT"){
                        console.log(err.message)
                      }
                    }
                  })
                }
              }
            }
          });
        }

        if (req.body.newImage) {
          let i = 0;

            for (let currentImage of req.body.newImage) {
              const base64Data = currentImage

              // Save base64 image to disk
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
                const imageBuffer = decodeBase64Image(base64Data);
                // Regular expression for image type:
                // Extracts the "jpeg" from "image/jpeg"
                const imageTypeRegularExpression = /\/(.*?)$/;      
                // This variable is actually an array which has 5 values,
                // The [1] value is the real image extension
                const imageTypeDetected = imageBuffer.type.match(imageTypeRegularExpression);
                const extension = imageTypeDetected[1]

                if (extension === "jpg" || extension === "jpeg" || extension === "png") {
                  const bufferToTestSize = Buffer.from(base64Data.substring(base64Data.indexOf(',') + 1));
                  // Byte length : bufferToTestSize.length | MB : bufferToTestSize.length / 1e+6
                  if (bufferToTestSize.length / 1e+6 <= 4) {
                    const myPath = './images/posts/';
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
                              reject("")
                            }
                            else {
                              images.push(pathForDb);
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
              i++;
            }
          if (i === req.body.newImage.length){
            postToDatabase()
          } 
        }
        else{
          postToDatabase()
        } 
      }
    }
  })
};


exports.addViewPost = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
 
  const id = req.body.id;
  const views = req.body.views;
  const lastViewDate = req.body.lastViewDate;

  // Save modified post in the database
  Post.modifyViews(id, views, lastViewDate, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || "Some error occurred while adding new view."
      });
    }
    else res.status(200).json({message: "Views updated"})
  });

};


exports.deletePost = (req, res, next) => {
  
  const id = req.body.id;
  const userId = req.auth.userId;

  Post.findById(id, userId, (err, postData) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found post`
        });
      } else {
        res.status(500).send({
          message: "Error"
        });
      }
    } 
    else{
      if (postData.user_id !== userId){
        res.status(401).json({message: "Unauthorized"});
      }
      else{
        Post.delete(id, (err, data) => {
          if (err) {
            res.status(500).send({
              message:
                err.message || "Some error occurred while erasing the post."
            });
          }
          else {
            res.status(200).json({message: "Post erased"});
            if (postData.image){
              // Delete post images
              JSON.parse(postData.image).forEach(async (imagePath) => {
                try {
                  const currentPath = '.' + imagePath;
                  await fs.unlinkSync(path.join(__dirname, currentPath))
                  //file removed
                }
                catch(err) {
                  if (err.code !== "ENOENT"){
                    console.log(err.message)
                  }
                }
              })
            }
          }
        });
      }
    }
  });
};


exports.getAllPosts = (req, res, next) => {
  
  const title = req.body.title !== "" ? req.body.title : null;
  const category = req.body.category.length !== 0 ? req.body.category : null;
  const order = req.body.order;
  
  Post.findAll(title, category, order, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving posts."
      });
    }
    else res.status(200).json(data);
  });
};


exports.getPostsByUserPrivate = (req, res, next) => {
  
  const userId = req.auth.userId;
  
  Post.findByUserPrivate(userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(200).json([]);
      }
      else{
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving posts."
        });
      }
    }
    else res.status(200).json(data);
  });
};


exports.getPostsByUser = (req, res, next) => {
  
  const pseudo = req.body.pseudo
  
  Post.findByUser(pseudo, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(200).json([]);
      }
      else{
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving posts."
        });
      }
    }
    else res.status(200).json(data);
  });
};


exports.getCommentedPostsByUser = (req, res, next) => {
  
  const userId = req.auth.userId;
  
  Post.findCommentedByUser(userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(200).json([]);
      }
      else{
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving posts."
        });
      }
    }
    else res.status(200).json(data);
  });
};


exports.getFavoritePostsByUser = (req, res, next) => {
  
  const userId = req.auth.userId;
  
  Post.findUserFavorites(userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(200).json([]);
      }
      else{
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving posts."
        });
      }
    }
    else res.status(200).json(data);
  });
};


exports.getOnePost = (req, res, next) => {
  
  const userId = req.ver.userId;

  Post.findById(req.body.id, userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found post with id ${req.body.id}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving post with id " + req.body.id
        });
      }
    } else {
      delete data.user_id
      res.status(200).json(data);
    }
  });
};


exports.getMostRecent = (req, res, next) => {
  
  Post.findMostRecent((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving posts."
      });
    else res.status(200).json(data);
  });
};


exports.getMostSeen = (req, res, next) => {
  
  Post.findMostSeen((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving posts."
      });
    else res.status(200).json(data);
  });
};


exports.getAllCategories = (req, res, next) => {
  
  Post.findAllCategories((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving categories."
      });
    else res.status(200).json(data);
  });
};