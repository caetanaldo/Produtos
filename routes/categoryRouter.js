import express from "express";
import categoryController from "../controllers/categoryController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const categoryRouter = express.Router();

categoryRouter.get("/", categoryController.getAll);
categoryRouter.get("/:id", categoryController.getById);
categoryRouter.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  categoryController.create,
);
categoryRouter.put("/:id", categoryController.update);
categoryRouter.delete("/:id", categoryController.delete);

export default categoryRouter;
