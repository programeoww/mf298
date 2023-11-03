import { CreationOptional, DataTypes, ENUM, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    declare id: CreationOptional<number>;
    
    declare name: string;
    declare birthday: number;
    declare password: string;
    declare phone: string;
    declare participateAs: string;
    declare localUnit: string;
    declare subLocalUnit: string;
    declare address: string;
    declare role: 'admin' | 'user';

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

export const UserModel = (sequelize: Sequelize) => {
    User.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        birthday: {
            type: DataTypes.INTEGER
        },
        password: {
            type: DataTypes.STRING
        },
        phone: {
            type: DataTypes.STRING
        },
        participateAs: {
            type: DataTypes.STRING
        },
        localUnit: {
            type: DataTypes.STRING
        },
        subLocalUnit: {
            type: DataTypes.STRING
        },
        address: {
            type: DataTypes.STRING
        },
        role: {
            type: ENUM('admin', 'user'),
            defaultValue: 'user'
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
        modelName: 'user',
    });

    return User;
}

export interface IUser extends InferAttributes<User> {}