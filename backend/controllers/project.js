
const Project = require ("../models/project.model.js");


exports.createProject = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
 
  const searchedProfiles = JSON.stringify(req.body.searchedProfiles)
  const style = JSON.stringify(req.body.style)

  // Create a project
  const project = new Project({
    title: req.body.title,
    content: req.body.content,
    searchedProfiles: searchedProfiles,
    style: style,
    creationDate: req.body.creationDate,
    modificationDate: null,
    image: req.body.image ? req.body.image : null,
    audio: req.body.audio ? req.body.audio : null,
    views: 0,
    lastViewDate: null,
    report: false,
    userId: req.auth.userId
  });
  console.log(project)

  // Save project in the database
  Project.create(project, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the project."
      });
    else res.status(201).json(data);
  });
};


exports.modifyProject = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  const id = req.body.id;
  const title = req.body.title;
  const content = req.body.content;
  const searchedProfiles = req.body.searchedProfiles;
  const style = req.body.style;
  const modificationDate = req.body.modificationDate;
  const image = req.body.image ? req.body.image : null;
  const audio = req.body.audio ? req.body.audio : null;
  const userId = req.auth.userId;

  Project.findById(id, userId, (err, data) => {
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
      if (data.user_id !== userId){
        res.status(401).json({message: "Unauthorized"});
      }
      else{
        // Save modified project in the database
        Project.modify(id, title, content, searchedProfiles, style, modificationDate, image, audio, (err, data) => {
          if (err){
            console.log("Erreur de modif : ", err.message)
            res.status(500).send({
              message:
                err.message || "Some error occurred while modifying the project."
            });
          }
          else res.status(200).json({message : "Project modified"});
        });
      }
    }
  });
};


exports.addViewProject = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
 
  const id = req.body.id;
  const views = req.body.views;
  const lastViewDate = req.body.lastViewDate;

  // Save modified post in the database
  Project.modifyViews(id, views, lastViewDate, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while adding new view."
      });
    else res.status(200).json({message: "Views updated"})
  });

};


exports.deleteProject = (req, res, next) => {
  
  const id = req.body.id;
  const userId = req.auth.userId;

  Project.findById(id, userId, (err, data) => {
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
      if (data.user_id !== userId){
        res.status(401).json({message: "Unauthorized"});
      }
      else{
        Project.delete(id, (err, data) => {
          if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while erasing the project."
          });
          else res.status(200).json({message: "Project erased !"});
        });
      }
    }
  });
};


exports.getAllProjects = (req, res, next) => {
  const title = req.body.title !== "" ? req.body.title : null;
  const searchedProfiles = req.body.searchedProfiles.length !== 0 ? req.body.searchedProfiles : null;
  const style = req.body.style.length !== 0 ? req.body.style : null;
  const order = req.body.order;
  
  Project.findAll(title, searchedProfiles, style, order, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving projects."
      });
    else res.status(200).json(data);
  });
};


exports.getProjectsByUserPrivate = (req, res, next) => {
  
  const userId = req.auth.userId;
  
  Project.findByUserPrivate(userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(200).json([]);
      }
      else{
        console.log(err.message)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving projects."
        });
      }
    }
    else res.status(200).json(data);
  });
};


exports.getProjectsByUser = (req, res, next) => {
  
  const pseudo = req.body.pseudo
  
  Project.findByUser(pseudo, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(200).json([]);
      }
      else{
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving projects."
        });
      }
    }
    else res.status(200).json(data);
  });
};


exports.getOneProject = (req, res, next) => {

  const userId = req.ver.userId;

  Project.findById(req.body.id, userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found project with id ${req.params.id}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving project with id " + req.body.id
        });
      }
      delete data.user_id
    } else res.status(200).json(data);
  });
};


exports.getAllSearchedProfiles = (req, res, next) => {
  
  Project.findAllSearchedProfiles((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving searched profiles."
      });
    else res.status(200).json(data);
  });
};


exports.getAllStyles = (req, res, next) => {
  
  Project.findAllStyles((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving styles."
      });
    else res.status(200).json(data);
  });
};