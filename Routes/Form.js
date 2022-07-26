const router=require('express').Router();
const Form=require('../Model/Form');
const auth=require('../Middleware/auth');
const User = require('../Model/User');
const nodemailer=require('nodemailer');


router.post('/create',auth,async(req,res)=>{
    try
    {
        const {area,district,size,designing,printed_material,quantity,inspection,date_of_display}=req.body;
        if(!area||!district||!size||!designing||!printed_material||!quantity||!inspection||!date_of_display)
        {
            return res.status(400).json({msg:"Required fields are missing!!"});
        }
        const email=(await User.findById(req.user)).email; 
        const form=new Form({
            area,
            district,
            size,
            designing,
            printed_material,
            quantity:parseInt(quantity),
            inspection,
            date_of_display:new Date(date_of_display),
            user_id:req.user
        });
        await form.save();
        const msg=`
          Area: ${area},
          District: ${district},
          Size: ${size},
          Designing: ${designing},
          Printed material: ${printed_material},
          Quantity: ${quantity},
          Inspection: ${inspection},
          Date of display: ${date_of_display}
        `;
        sendEmail(email,msg);
        return res.status(200).json({msg:"Form added successfully"});
    }
    catch(err)
    {
        console.log(err.message);
        res.status(500).json({msg:"Internal server error"});
    }
});



const sendEmail=async(receiver,msg)=>{
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
            subject:"Response form ",
            text:msg
        }

       await transporter.sendMail(mailOptions);
    }
    catch(err)
    {
        console.log(err);
        throw err;
    }
}

module.exports=router;