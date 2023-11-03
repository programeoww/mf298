import { CreationOptional, DataTypes, ENUM, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

class QuizAttempt extends Model<InferAttributes<QuizAttempt>, InferCreationAttributes<QuizAttempt>> {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    declare id: CreationOptional<number>;
    
    declare user_id: number;
    declare file_path: string;
    declare score: number;
    declare start_time: string;
    declare end_time: string;
    declare total_time: number;
    declare certificate_path: string;
    declare unAnswered: number;
    declare wrongAnswered: number;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

export const QuizAttemptModel = (sequelize: Sequelize) => {
    QuizAttempt.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        file_path: {
            type: DataTypes.STRING
        },
        score: {
            type: DataTypes.INTEGER
        },
        start_time: {
            type: DataTypes.STRING
        },
        end_time: {
            type: DataTypes.STRING
        },
        total_time: {
            type: DataTypes.INTEGER
        },
        certificate_path: {
            type: DataTypes.STRING
        },
        unAnswered: {
            type: DataTypes.INTEGER
        },
        wrongAnswered: {
            type: DataTypes.INTEGER
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
    }, {
        sequelize,
        modelName: 'quiz_attempt',
    });

    return QuizAttempt;
}

export interface IQuizAttempt extends InferAttributes<QuizAttempt> {}