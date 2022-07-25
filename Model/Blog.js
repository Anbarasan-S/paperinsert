const mongoose=require('mongoose');

const Blog=new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    blog:
    {
        type:String,
        required:true
    },
    title:
    {
        type:String,
        required:true
    }
});

module.exports=mongoose.model('Blog',Blog);