const route=require('express').Router();
const Blog=require('../Model/Blog');
const auth=require('../Middleware/auth');
const User = require('../Model/User');

route.post('/add',auth,async(req,res)=>{
        const{blog,title}=req.body;        
        if(!blog||!title)
        {
            return res.status(400).json({msg:"Required fields are missing!!"});
        }
    try
    {
        if(await Blog.findOne({title}))
        {
            return res.status(400).json({msg:"A blog with the same title already exists"});
        }
        const new_blog=new Blog({blog,title,user_id:req.user});
        await new_blog.save();
        res.status(200).json({msg:"Blog created successfully",new_blog});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({msg:"Internal server error"});
    }
});






route.get('/get',auth,async(req,res)=>{
        try
        {

            const user=await User.findById(req.user);
            if(!user)
            {
                return res.status(400).json({msg:"User does not exists!!"});
            }

            const blogs=await Blog.find({user_id:req.user});
            
            return res.status(200).json({blogs});
        }
        catch(err)
        {
            console.log(err);
            res.status(500).json({msg:"Internal server error"});
        }
})


route.put('/edit/:blog_id',auth,async(req,res)=>{
    try
    {
        const user=await User.findById(req.user);
        const{blog,title}=req.body;
        console.log(req.body);
        if(!blog||!title)
        {
            return res.status(400).json({msg:"Required fields are missing!!"});
        }
        if(!user)
        {
            return res.status(400).json({msg:"User does not exists!!"});
        }
        const edit_blog=await Blog.findById(req.params.blog_id);
        if(!edit_blog)
        {
            return res.status(400).json({msg:"Invalid request!!"});
        }

        if(edit_blog.title!==title)
        {
            if(await Blog.findOne({title:title}))
            {
                return res.status(400).json({msg:"Blog with the same title already exists"});
            }
        }

            edit_blog.blog=blog;
            edit_blog.title=title;
        
        await edit_blog.save();
        res.status(200).json({msg:"Edited the blog successfully ",blog:edit_blog});
    }
    catch(err)
    {
    
        res.status(500).json({msg:"Internal server error"});
    }

});


route.delete('/remove/:blog_id',auth,async(req,res)=>{
    try
    {
        const blog_id=req.params.blog_id;
        const user=await User.findById(req.user);
        if(!user)
        {
            return res.status(400).json({msg:"User does not exists!!"});
        }

        if(!await Blog.findById(blog_id))
        {
            return res.status(400).json({msg:"Blog does not exists"});
        }
        await Blog.deleteOne({_id:blog_id});

        res.status(200).json({msg:`Blog deleted successfully`});
    }
    catch(err)
    {
        
        res.status(500).json({msg:"Internal server error"});
    }
})

module.exports=route;