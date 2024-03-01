/*const { Sequelize, Model, DataTypes } = require('sequelize');


const sequelize = new Sequelize('cubasics', 'root', '', {
	host: 'localhost',
	dialect: 'mysql'
});

sequelize.authenticate()
	.then(() => console.log('Connection has been established successfully.'))
	.catch ((error) => console.error('Unable to connect to the database:', error));


const Favorite = sequelize.define('favorite', {
  // Model attributes are defined here
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    foreignKey: true
    // allowNull defaults to true
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    foreignKey: true
    // allowNull defaults to true
  }
});

// `sequelize.define` also returns the model
// console.log(Favorite === sequelize.models.Favorite);
*/