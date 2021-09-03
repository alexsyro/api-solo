const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate({ ContactBook, Message }) {
      // define association here
      User.hasOne(ContactBook);
      User.hasMany(Message, { foreignKey: 'AuthorId' });
      User.hasMany(Message, { foreignKey: 'ReceiverId' });
    }
  }
  User.init(
    {
      FullName: {
        field: 'full_name',
        allowNull: false,
        type: DataTypes.TEXT,
      },
      login: {
        allowNull: false,
        type: DataTypes.TEXT,
        unique: true,
      },
      email: {
        allowNull: false,
        type: DataTypes.TEXT,
        unique: true,
      },
      password: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      phone: {
        type: DataTypes.TEXT,
      },
      avatar: {
        type: DataTypes.TEXT,
      },
      CypherKey: {
        field: 'cypher_key',
        type: DataTypes.TEXT,
      },
      cypher_key: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'User',
    },
  );
  return User;
};
