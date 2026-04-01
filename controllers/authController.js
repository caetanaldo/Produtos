import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "segredo";
const authController = {
  register: async (req, res) => {
    try {
      const { email, password, role } = req.body;
      console.log(role)
      // hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        email,
        password: hashedPassword,
        role: role || 'user'
      });

      res.status(201).json({ message: "Usuário criado", user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // comparar senha
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ message: "Senha inválida" });
      }

      // gerar token
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, {
        expiresIn: "1h",
      });

      res.json({ message: "Login sucesso", token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
export default authController;
