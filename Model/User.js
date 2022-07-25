const mongoose=require('mongoose');

const User=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    verified:{
        type:Boolean,
        default:false
    },
    username:{
        type:String,
        required:true,
    },
    verificationId:{
        type:Number,
        required:true
    }
});


module.exports=mongoose.model('User',User);
