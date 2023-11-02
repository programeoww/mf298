import { Sequelize } from 'sequelize';
import { UserModel, IUser } from './user';

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

export const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: false,
  }
); 

const User = UserModel(sequelize)

//we can add relationships between models here

// User.hasMany(Post, {
//   foreignKey: 'userId',
//   as: 'posts'
// });

export {
  User as UserModel,
};

export type { IUser }
