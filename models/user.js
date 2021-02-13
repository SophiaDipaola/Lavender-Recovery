'use strict';
const bcrypt = require('bcrypt')

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      // define association here
    }
    validPassword(typedPassword) {
      let isCorrectPassword = bcrypt.compareSync(typedPassword, this.password);
      return isCorrectPassword
    }

    toJSON() {
      let userData = this.get();
      // deletes password from returned user
      delete userData.password;
      return userData;
    }
  };
  user.init({
    name: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [1, 99],
          msg: "Name must be between 1 and 99 chars"
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          msg: "Invalid email"
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        len:{
          args: [8, 99],
          msg: "Password must be between 8 and 99"
        }
      }
    }
  }, {
    sequelize,
    modelName: 'user',
  });

  user.addHook('beforeCreate', (pendingUser)=> {
    // encrypt before saving in the db
    if (pendingUser && pendingUser.password) {
      let hash = bcrypt.hashSync(pendingUser.password, 12);
      pendingUser.password = hash;
    }
  })

  return user;
};
