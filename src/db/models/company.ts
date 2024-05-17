import { Model, Optional, Sequelize, DataTypes } from "sequelize";

interface CompanyAttributes {
  id: number;
  name_company: string;
  address: string;
  phone: string;
  email: string;
  password: string;
  customerstripeId: string;
  status: boolean;
  isAdmin: boolean;
  createAt?: Date;
  updatedAt?: Date;
  stateCity: string
}

export interface CompanyInput extends Optional<CompanyAttributes, "id"> { }
export interface CompanyOutput extends Required<CompanyAttributes> { }

class Company extends Model<CompanyAttributes, CompanyInput> implements CompanyAttributes {
  public id!: number;
  public name_company!: string;
  public address!: string;
  public phone!: string;
  public email!: string;
  public password!: string;

  public customerstripeId!: string;
  public stateCity!: string;

  public status!: boolean;
  public isAdmin!: boolean;
  public readonly createAt?: Date;
  public readonly updatedAt?: Date;

  static associate(models: any) {
    /* asignaciones de la compañia para el admin */
    Company.belongsToMany(models.Trade, { through: models.CompanyTrade });

    /* asignaciones de la compañia para el usuario-Compania */
    Company.belongsToMany(models.User, { through: models.CompanyUser });
    Company.belongsToMany(models.TradeCompanyUser, { through: models.TradeCompanyProfile });
    Company.belongsTo(models.Token);
  }
}

module.exports = (sequelize: Sequelize) => {
  Company.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name_company: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      customerstripeId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      stateCity: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      underscored: false,
      timestamps: true,
      modelName: "Company",
    }
  );
  return Company;
};
