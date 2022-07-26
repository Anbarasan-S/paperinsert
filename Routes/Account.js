const express=require('express');
const route=express.Router();
const User=require('../Model/User');
const bcrypt=require('bcrypt');
const nodemailer=require('nodemailer');
const jwt=require('jsonwebtoken');

route.post('/signup',async(req,res)=>{
        const{email,password,username}=req.body;
        console.log(email,password,username);
        try
        {
            let user=await User.findOne({email});
    
            if(user)
            {
                return res.status(400).json({"msg":"User with the email already exists!!"});
            }

            if(await User.findOne({username}))
            {
                return res.status(400).json({"msg":"User with the username already exists!!"});
            }

            user=new User({email,password,username});

            user.password=await bcrypt.hash(user.password,10);
            
            const token=jwt.sign({
                email:email
            },process.env.JWT_SECRET);

            let verificationCode =Math.floor(Math.random()*90000) + 10000;

            console.log(`the verificationCode is ${verificationCode}`);

            user.verificationId = verificationCode;

            await sendEmail(email,verificationCode);
            
                        
            await user.save();

            res.status(200).json({msg:"Verify the link sent to your email!!"});
        }
        catch(err)
        {
            console.log(`Error in signup ${err}`);
            res.status(500).json({msg:"Internal server error"});
        }    
});


route.post('/codeVerification',async(req,res)=>{
    try {
        const {email,verificationCode}=req.body;
        let user = await User.findOne({'email':email});
        
        console.log(`the user in verificationid is ${user}`);
        if(user==''||user==null){
            res.status(400).json({'msg':"user with this email doesn't exists.Try signing in "});

        }else{
        let storedId = user.verificationId;

        console.log(`the storedid id ${storedId}`);
        if(storedId===verificationCode){
            console.log('verificationID is same');
            await user.updateOne({'verified':true})
            console.log(`the user is ${user}`);
            res.status(200).json({'msg':"This user is successfully verified"})

        }else{
            console.log('Not verified');
        res.status(400).json({'msg':'invalid verificationId. Try resending the verification code'});
        }
    }
    } catch (e) {
        console.log(e);
        res.status(500).json({msg:"Internal server error"});    
    }
})

route.get('/resendOTP/:email',async(req,res)=>{
try {
    email= req.params.email;
    
    let user = User.findOne({'email':email});

    if(user==''||user==null){
       return res.status(400).json({'msg':"user with this email doesn't exists.Try signing in "});
       

    }else{
        let verificationCode =Math.floor(Math.random()*90000) + 10000;

        console.log(`the verificationCode is ${verificationCode}`);

        await user.updateOne({'verificationId':verificationCode});
        await sendEmail(email,verificationCode);
       return res.status(200).json({'msg':"OTP resend successfully"});
    }

} catch (e) {
    console.log(e);
    res.status(500).json({msg:"Internal server error"}); 
}
})

route.get('/getUser/:email',async(req,res)=>{
    try {
        email= req.params.email;
        console.log(`the params is ${email}`);
        let user =await User.findOne({'email':email});

 if(user==''||user==null){
    return res.status(400).json({'msg':"user with this email doesn't exists.Try signing in "});
}
else{
        return res.status(200).json({'user':user});
    }

    } catch (e) {
        console.log(e);
        res.status(500).json({msg:"Internal server error"}); 
    }
})

route.delete('/removeUser',async(req,res)=>{
    try {
       const {email}=req.body;
       let user = await User.findOne({'email':email});
       console.log(`the user is ${user}`);
       if(user==''||user==null){

       return res.status(400).json({'msg':"user with this email doesn't exists.Try signing in "});

    }else{
            await User.deleteOne({'email':email});
            
         return res.status(200).json({'msg':'User removed successfully'});
        }
       
       
    
    } catch (e) {
        console.log(e);
        res.status(500).json({msg:"Internal server error"});  
    }
})
route.post('/verify',async(req,res)=>{

        try
        {
            console.log(req.query.token);
            const token=req.query.token;
            const verified=jwt.verify(token,process.env.JWT_SECRET);

            if(!verified)
            {
                return res.status(400).json({msg:"Invalid verification link!!"});
            }

            const email=verified.email;
            

            const user=await User.findOne({email});
            if(!user)
            {
                return res.status(400).json({msg:"Invalid verification link!!"});
            }

            user.verified=true;
            await user.save();
            
            res.status(200).json({msg:"Account verified successfully. Login to continue"});
        }
        catch(err)
        {
            console.log(err);
            res.status(500).json({msg:"Internal server error"});          
        }
});

route.post('/login',async(req,res)=>{
    try
    {
        const {username,password}=req.body;
        if(!username||!password)
        {
            return res.status(400).json({msg:"Required fields are missing!!"});
        }
    
        const user=await User.findOne({username:username})||await User.findOne({email:username});
    
        if(!user)
        {
            return res.status(400).json({msg:"User does not exists"});
        }

        if(user.verified===false)
        {
            return res.status(400).json({msg:"User is not verified yet!!"});
        }
        
        const matched=await bcrypt.compare(password,user.password);

        if(!matched)
        {   
            return res.status(400).json({msg:"Invalid password"});
        }

        const token=jwt.sign({user:user._id},process.env.JWT_SECRET);

        res.status(200).json({msg:"Logged in successfully",token});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({msg:"Internal server error"});
    }
});




const sendEmail=async(receiver,verificationCode)=>{
    try
    {
        let transporter=nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:process.env.GMAIL_ID,
                pass:process.env.GMAIL_PASS
            }
        });

        const mailOptions={
            from:process.env.GMAIL_ID,
            to:receiver,
            subject:"Verification code ",
            text:`Your Verification code is ${verificationCode}`
        }

       await transporter.sendMail(mailOptions);
    }
    catch(err)
    {
        console.log(err);
        throw err;
    }
}

module.exports=route;


