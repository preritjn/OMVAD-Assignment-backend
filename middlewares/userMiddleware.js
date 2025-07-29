const jwt = require('jsonwebtoken')

export function userMiddleware(req,res,next) {
    const token = req.cookies.auth
    console.log(token)   
        
    if(!token) {
        return res.status(401).json({ message: "Unauthorized" })
    }
    try {
        const user = jwt.verify(token, process.env.JWT_KEY)        
        req.email = user.email
        next()
    }
    catch(err) {
        return res.status(401).json({ message: "Unauthorized" })
    }
}