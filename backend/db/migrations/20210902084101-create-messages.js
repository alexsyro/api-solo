module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      AuthorId: {
        field: 'author_id',
        type: Sequelize.INTEGER,
        reference: {
          model: 'Users',
          key: 'id',
          onUpdate: 'CASCADE',
        },
      },
      message: {
        type: Sequelize.TEXT,
      },
      ReceiverId: {
        field: 'receiver_id',
        type: Sequelize.INTEGER,
        reference: {
          model: 'Users',
          key: 'id',
          onUpdate: 'CASCADE',
        },
      },
      createdAt: {
        type: Sequelize.DATE,
      },
      updatedAt: {
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Messages');
  },
};
