import { CreationOptional, DataTypes, ENUM, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

class QuizAnswer extends Model<InferAttributes<QuizAnswer>, InferCreationAttributes<QuizAnswer>> {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    declare id: CreationOptional<number>;
    
    declare quiz_attempt_id: number;
    declare question: string;
    declare answer: string;
    declare timestamp: string;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

export const QuizAnswerModel = (sequelize: Sequelize) => {
    QuizAnswer.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        quiz_attempt_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'QuizAttempt',
                key: 'id'
            }
        },
        question: DataTypes.TEXT('long'),
        answer: DataTypes.TEXT('long'),
        timestamp: DataTypes.STRING,
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
        modelName: 'quiz_answer',
    });

    return QuizAnswer;
}

export interface IQuizAnswer extends InferAttributes<QuizAnswer> {}