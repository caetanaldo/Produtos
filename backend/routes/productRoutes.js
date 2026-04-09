import express from "express";
import productController from "../controllers/productController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import validateMiddleware from "../middlewares/validateMiddleware.js";
import { productSchema } from "../validations/productValidation.js";
import isAdmin from "../middlewares/isAdmin.js"

const productRouter = express.Router();
productRouter.use(authMiddleware)

productRouter.get('/', productController.getAll)
productRouter.get('/:id', productController.getById)
productRouter.post('/', validateMiddleware(productSchema), isAdmin, productController.create)
productRouter.put('/:id', isAdmin, productController.update)
productRouter.delete('/:id', isAdmin, productController.delete)

export default productRouter;