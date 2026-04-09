export function roleMiddleware(requiredRole){
    return (req,res,next)=>{
        if(req.userRole !== requiredRole){
            return res.status(403).json({
                error: "Acesso negado"
            })
        }
        next()
    }
}