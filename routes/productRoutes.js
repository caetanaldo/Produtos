import express from "express";
import productController from "../controllers/productController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import validateMiddleware from "../middlewares/validateMiddleware.js";
import { productSchema } from "../validations/productValidation.js";

const productRouter = express.Router();
productRouter.use(authMiddleware)

productRouter.get('/', productController.getAll)
productRouter.get('/:id', productController.getById)
productRouter.post('/', validateMiddleware(productSchema), productController.create)
productRouter.put('/:id', productController.update)
productRouter.delete('/:id', productController.delete)

export default productRouter;