module.exports = (req,res,next) => {
    if(req.session.bearerToken !== undefined){
        next();
    }else{
        res.redirect("/connexion");
    }
}