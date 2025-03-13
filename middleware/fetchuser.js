var jwt = require('jsonwebtoken');
const JWT_SECRET = 'Harryisagood$boy';


const fetchuser = (req,res,next) => {
    //Get the user from the JWT token and add id to request object.
    const token = req.header('auth-token');
    if(!token){
        res.send(401).send({error : "Please authenticate using a valid token"});
    }
    try{
        const data = jwt.verify(token,JWT_SECRET);
        req.user = data.user;
        next();
    }catch(error){
        res.status(401).send({error : "Please authenticate using a valid token"});
    }
    
} 

module.exports = fetchuser;