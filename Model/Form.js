const mongoose=require('mongoose');

const Form=new mongoose.Schema({
    area:{
        type:String
    },
    district:{
        type:String
    },
    size:
    {
        type:String
    },
    designing:
    {
        type:String
    },
    printed_material:
    {
        type:String
    },
    quantity:
    {
        type:Number
    },
    inspection:
    {
        type:String
    },
    date_of_display:
    {
        type:Date
    },
    user_id:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
});

module.exports=mongoose.model('Form',Form);