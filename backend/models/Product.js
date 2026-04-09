import { DataTypes, DATE } from "sequelize";
import { sequelize } from "../database/sqlConnection.js";

const Product = sequelize.define("Product",{
    name:{
        type: DataTypes.STRING,
        allowNull: false
    },
    price:{
        type: DataTypes.FLOAT,
        allowNull: false
    },
});

export default Product