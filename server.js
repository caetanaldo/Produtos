import express, { json } from "express";
import { connect } from "./database/sqlConnection.js";
import productRouter from "./routes/productRoutes.js";
import authRouter from "./routes/authRouter.js";


import 'dotenv/config'

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use('/products', productRouter)
app.use('/auth', authRouter)

app.listen(PORT, () => {
  connect();
  console.log(`Servidor rodando no link http://localhost:${PORT}`);
});
