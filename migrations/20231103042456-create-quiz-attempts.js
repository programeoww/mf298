'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('quiz_attempts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
          type: Sequelize.INTEGER,
          references: {
              model: 'users',
              key: 'id'
          }
      },
      file_path: Sequelize.STRING,
      score: Sequelize.INTEGER,
      start_time: Sequelize.DATE,
      end_time: Sequelize.DATE,
      total_time: Sequelize.INTEGER,
      certificate_path: Sequelize.STRING,
      unAnswered: {
        type: Sequelize.INTEGER
      },
      wrongAnswered: {
          type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('quiz_attempts');
  }
};