import { Sequelize } from "sequelize";
import dotenv from 'dotenv'

dotenv.config({path:"./config/.env"})
const database = process.env.DB
const user = process.env.DBUSER
const password = process.env.DBPASSWORD


const sequelize = new Sequelize(database, user, password, {
  host: "localhost",
  dialect: "mysql",
  port: 3306,
});

async function connect() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({alter:true})
    console.log("✅ Conexao com SQL estabelecida");
  } catch (error) {
    console.error("❌ Error ao conectar no SQL:", error);
  }
}

export { sequelize, connect };
