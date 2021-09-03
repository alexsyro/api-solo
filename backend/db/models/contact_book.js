const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ContactBook extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ ContactList, User }) {
      // define association here
      ContactBook.hasMany(ContactList);
      ContactBook.belongsTo(User);
    }
  }
  ContactBook.init(
    {
      UserId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        reference: {
          model: 'Users',
          key: 'id',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      },
    },
    {
      sequelize,
      tableName: 'Contact_books',
      modelName: 'ContactBook',
    },
  );
  return ContactBook;
};
