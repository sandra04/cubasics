
const Comment = require ("../models/comment.model.js");


exports.createComment = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create a comment
  const comment = new Comment({
    content: req.body.content,
    image: req.body.image ? req.body.image : null,
    audio: req.body.audio ? req.body.audio : null,
    creationDate: req.body.creationDate,
    modificationDate: null,
    likes:null,
    report: false,
    userId: req.auth.userId,
    postId: req.body.postId,
    commentId: req.body.commentId ? req.body.commentId : null
  });
  console.log(comment)

  // Save comment in the database
  Comment.create(comment, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the comment."
      });
    else res.status(201).json({message: "New comment created"});
  });
};


exports.modifyComment = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  const id = req.body.id;
  const content = req.body.content;
  const modificationDate = req.body.modificationDate;
  const image = req.body.image ? req.body.image : null;
  const audio = req.body.audio ? req.body.audio : null;
  const userId = req.auth.userId;

  Comment.findById(id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found comment`
        });
      } else {
        res.status(500).send({
          message: "Error"
        });
      }
    } 
    else{
      if (data.user_id !== userId){
        res.status(401).json({message: "Unauthorized"});
      }
      else{
        // Save modified post in the database
        Comment.modify(id, content, modificationDate, image, audio, (err, data) => {
          if (err)
            res.status(500).send({
              message:
                err.message || "Some error occurred while modifying the comment."
            });
          else res.status(200).json({message: "Comment modified"});
        });
      }
    }
  });
};


exports.deleteComment = (req, res, next) => {
  
  const id = req.body.id;
  const userId = req.auth.userId;

  Comment.findById(id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found comment`
        });
      } else {
        res.status(500).send({
          message: "Error"
        });
      }
    } 
    else{
      if (data.user_id !== userId){
        res.status(401).json({message: "Unauthorized"});
      }
      else{
        Comment.delete(id, (err, data) => {
          if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while erasing the comment."
          });
          else res.status(200).json({message: "Comment erased"});
        });
      }
    }
  });
};


exports.getCommentsByPost = (req, res, next) => {
  
  const postId = req.body.postId;
  const userId = req.ver.userId;
  console.log("Hello, user ", userId)
  Comment.findCommentsByPost(postId, userId, (err, data) => {
    if (err) {
      console.log(err.message)
      res.status(500).send({
          message: "Error while retrieving comments"
      });    
    }
    else {
      console.log("comments : ", data)
      res.status(200).json(data);
    }
  });
};