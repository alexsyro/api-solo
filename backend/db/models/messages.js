const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User }) {
      Message.belongsTo(User, { foreignKey: 'AuthorId' });
      Message.belongsTo(User, { foreignKey: 'ReceiverId' });
    }
  }
  Message.init(
    {
      AuthorId: {
        field: 'author_id',
        type: DataTypes.INTEGER,
        reference: {
          model: 'Users',
          key: 'id',
          onUpdate: 'CASCADE',
        },
      },
      message: {
        type: DataTypes.TEXT,
      },
      ReceiverId: {
        field: 'receiver_id',
        type: DataTypes.INTEGER,
        reference: {
          model: 'Users',
          key: 'id',
          onUpdate: 'CASCADE',
        },
      },
    },
    {
      sequelize,
      modelName: 'Message',
    },
  );
  return Message;
};
