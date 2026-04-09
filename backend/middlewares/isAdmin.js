const isAdmin = (req,res,next)=>{
    if (req.userRole !== 'admin'){
        return res.status(403).json({
            sucess: false,
            message: "Acesso negado. Apenas administradores.",
        });
    };
    next();
};

export default isAdmin