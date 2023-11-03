import { Sequelize } from 'sequelize';
import { UserModel, IUser } from './user';
import { QuizAttemptModel, IQuizAttempt } from './quiz_attempts';
import { QuizAnswerModel, IQuizAnswer } from './quiz_answer';

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
const QuizAttempt = QuizAttemptModel(sequelize)
const QuizAnswer = QuizAnswerModel(sequelize)

User.hasMany(QuizAttempt, { foreignKey: 'user_id' });
QuizAttempt.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
QuizAttempt.hasMany(QuizAnswer, { foreignKey: 'quiz_attempt_id' });

export {
  User as UserModel,
  QuizAttempt as QuizAttemptModel,
  QuizAnswer as QuizAnswerModel,
};

export type { IUser, IQuizAttempt, IQuizAnswer }
