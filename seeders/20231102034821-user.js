'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

    const hashPassword = await bcrypt.hash('Mediafindme@111', 10);
   
    await queryInterface.bulkInsert('users', [
      {
        name: 'Admin',
        birthday: 1990,
        password: hashPassword,
        phone: '0862661503',
        participateAs: 'Đảng viên',
        localUnit: 'Đảng bộ phường Cầu Diễn',
        address: 'Số 1, đường Cầu Diễn, phường Cầu Diễn, quận Nam Từ Liêm, Hà Nội',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete('users', null, {});
  }
};
