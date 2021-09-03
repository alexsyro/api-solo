const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ContactList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ ContactBook, User }) {
      // define association here
      ContactList.belongsTo(ContactBook);
      ContactList.belongsTo(User);
    }
  }
  ContactList.init(
    {
      ContactBookId: {
        field: 'contact_book_id',
        type: DataTypes.INTEGER,
        reference: {
          model: 'Contact_books',
          key: 'id',
        },
      },
      UserId: {
        field: 'user_id',
        type: DataTypes.INTEGER,
        reference: {
          model: 'Users',
          key: 'id',
        },
      },
      pseudo: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      tableName: 'Contacts_list',
      modelName: 'ContactList',
    },
  );
  return ContactList;
};
