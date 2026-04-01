import { DataTypes, DATE } from "sequelize";
import { sequelize } from "../database/sqlConnection.js";
import Category from "./Category.js";

const Product = sequelize.define("Product",{
    name:{
        type: DataTypes.STRING,
        allowNull: false
    },
    price:{
        type: DataTypes.FLOAT,
        allowNull: false
    },
    categoryId:{
        type: DataTypes.INTEGER,
        references:{
            model:Category,
            key: "id"
        }
    }
})

Category.hasMany(Product, {foreignKey:"categoryId", as: "products"})
Product.belongsTo(Category,{foreignKey:"categoryId",as: "category"})

export default Product