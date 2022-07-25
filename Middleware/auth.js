const jwt=require('jsonwebtoken');
const User=require('../Model/User');

const auth=async(req,res,next)=>{
    try
    {
        const token=req.header('x-auth-token');
        if(!token)
        {
            return res.status(401).json({msg:"No token authorisation denied sign in"});
        }

        const verify=jwt.verify(token,process.env.JWT_SECRET);

        if(!verify)
        {
            return res.status(400).json({msg:"Token expired sign in again"});
        }

        req.user=verify.user;
        next();
    }
    catch(err)
    {
        console.log(`Error in auth js ${err}`);
        res.status(500).json({msg:"Internal server error"});
    }
}



module.exports=auth;