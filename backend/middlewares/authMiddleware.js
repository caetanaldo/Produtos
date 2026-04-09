import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "segredo";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;  
  if (!authHeader) {
    return res.status(401).json({
      error: "Token não fornecido",
    });
  }

  //["Bearer","jwtshuashuashaushaa.ashuasuhashusa.ashuahsas"]
  const [, token] = authHeader.split(" ");

  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Token invalido",
    });
  }
}
