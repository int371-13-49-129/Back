module.exports = (sequelize, Sequelize) => {
    const Account = sequelize.define(
      "account",
      {
        account_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        username: Sequelize.STRING,
        password: Sequelize.STRING,
        email: { 
          type: Sequelize.STRING,
          validate: { isEmail: true } 
        },
        gender: {
          type: Sequelize.ENUM,
          allowNull: false,
          defaultValue: "Unspecified",
          values: ["Male","Female","Unspecified"],
        },
        image_url: Sequelize.STRING,
        date_of_birth: Sequelize.DATEONLY,
        role: {
          type: Sequelize.ENUM,
          allowNull: false,
          defaultValue: "Member",
          values: ["Member", "Psychologist"],
        },
        status: {
          type: Sequelize.ENUM,
          allowNull: false,
          defaultValue: "Waiting",
          values: ["Confirmed","Waiting"],
        },
        is_delete: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        freezeTableName: true,
        underscored: true,
        timestamps: true,
      }
    );
    return Account;
  };
  