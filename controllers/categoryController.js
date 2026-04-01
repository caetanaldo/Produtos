import Category from "../models/Category.js";
import Product from "../models/Product.js";

const categoryController = {
  getAll: async (req, res) => {
    try {
      const categories = await Category.findAll({
        include: {
          model: Product,
          as: "products",
        },
      });

      return res.status(200).json({
        success: true,
        data: categories,
        message: "Categorias listadas com sucesso!",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao listar categorias",
        error: error.message,
      });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const category = await Category.findByPk(id, {
        include: {
          model: Product,
          as: "products",
        },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          data: null,
          message: "Categoria não encontrada",
        });
      }

      return res.status(200).json({
        success: true,
        data: category,
        message: "Categoria encontrada com sucesso!",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar categoria",
        error: error.message,
      });
    }
  },

  create: async (req, res) => {
    try {
      const { name, description } = req.body;

      const category = await Category.create({
        name,
        description,
      });

      return res.status(201).json({
        success: true,
        data: category,
        message: "Categoria criada com sucesso!",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao criar categoria",
        error: error.message,
      });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const category = await Category.findByPk(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          data: null,
          message: "Categoria não encontrada",
        });
      }

      await category.update({
        name: name ?? category.name,
        description: description ?? category.description,
      });

      return res.status(200).json({
        success: true,
        data: category,
        message: "Categoria atualizada com sucesso!",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao atualizar categoria",
        error: error.message,
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const category = await Category.findByPk(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          data: null,
          message: "Categoria não encontrada",
        });
      }

      await category.destroy();

      return res.status(200).json({
        success: true,
        data: null,
        message: "Categoria removida com sucesso!",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao remover categoria",
        error: error.message,
      });
    }
  },
};

export default categoryController;