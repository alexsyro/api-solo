module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      FullName: {
        field: 'full_name',
        allowNull: false,
        type: Sequelize.TEXT,
      },
      login: {
        allowNull: false,
        type: Sequelize.TEXT,
        unique: true,
      },
      email: {
        allowNull: false,
        type: Sequelize.TEXT,
        unique: true,
      },
      password: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      phone: {
        type: Sequelize.TEXT,
      },
      avatar: {
        type: Sequelize.TEXT,
      },
      CypherKey: {
        field: 'cypher_key',
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('Users');
  },
};
