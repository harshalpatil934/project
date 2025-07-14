const listing=require("./models/listing");
const Review=require("./models/review");
const ExpressError=require("./util/ExpressError.js");
const {listingSchema ,reviewSchema}=require("./schema.js");
const review = require("./models/review.js");

module.exports.isLoggedIn=(req,res,next)=>{
   if(!req.isAuthenticated()){
    req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be loged in to create listing!");
      return  res.redirect("/login");
    }
    next();
}

module.exports.saveUrl=(req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  }
  next();
}

module.exports.isOwner=async(req,res,next)=>{
  let {id}=req.params;
  let list = await listing.findById(id);
  if(!list.owner._id.equals(res.locals.currUser._id)){
      req.flash("error","you dont have permission to edit or delete the listing")
      return res.redirect(`/listings/${id}`);
  }
  next();
}

module.exports.validateList=(req,res,next)=>{
      let  {error} = listingSchema.validate(req.body);
        console.log(error);
        if(error){
            let errmsg=error.details.map((el=>{el.message})).join(",");
            throw new ExpressError(400,error.message);
        }else{
            next();
        }
}

module.exports. validateReview=(req,res,next)=>{
      let  {error} = reviewSchema.validate(req.body);
        console.log(error);
        if(error){
            let errmsg=error.details.map((el=>{el.message})).join(",");
            throw new ExpressError(400,error.message);
        }else{
            next();
        }
}

module.exports.isAuthor=async(req,res,next)=>{
  let {id,reviewId}=req.params;
  let review = await Review.findById(reviewId);
  if(!review.author.equals(res.locals.currUser._id)){
      req.flash("error","you dont have permission to delete the reviews")
      return res.redirect(`/listings/${id}`);
  }
  next();
}