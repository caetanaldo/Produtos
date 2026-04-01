import { DataTypes } from "sequelize";
import { sequelize } from "../database/sqlConnection.js";

const Category = sequelize.define("Category",{
    name:{
        type: DataTypes.STRING,
        allowNull: false
    },
    description:{
        type: DataTypes.STRING
    }
})

export default Category