const mongoose=require('mongoose');

const connect=async()=>{
    mongoose.connect(process.env.MONGO_URI);
    console.log(`connected to db successfully`);
}

module.exports=connect;