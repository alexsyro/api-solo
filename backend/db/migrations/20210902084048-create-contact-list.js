module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Contacts_list', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      ContactBookId: {
        field: 'contact_book_id',
        type: Sequelize.INTEGER,
        reference: {
          model: 'Contact_books',
          key: 'id',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      },
      UserId: {
        field: 'user_id',
        type: Sequelize.INTEGER,
        reference: {
          model: 'Users',
          key: 'id',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      },
      pseudo: {
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
    await queryInterface.dropTable('Contacts_list');
  },
};
