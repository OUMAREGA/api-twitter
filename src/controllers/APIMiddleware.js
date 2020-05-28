module.exports = (req,res,next) => {
    if(req.session.userData){
        next();
    }else{
        res.status(401);
        res.json({message:"Unauthorized"});
    }
}