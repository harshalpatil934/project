const express=require("express");
const router=express.Router({mergeParams:true});


const wrap=require("../util/wrap.js");
const {validateReview,isLoggedIn, isOwner,isAuthor}=require("../middleware.js")
const ExpressError=require("../util/ExpressError.js");
const Review=require("../models/review.js");
const listing=require("../models/listing.js");




//review 

router.post("/",isLoggedIn,validateReview,wrap(async (req,res)=>{
   let list=await listing.findById(req.params.id);
   let newReview=new Review(req.body.review);
   newReview.author=req.user._id;
   console.log(newReview)
   list.reviews.push(newReview);
   await newReview.save();

   await list.save();
   console.log("new review saved");
//    res.send("new review saved");
req.flash("success","new review created");
   res.redirect(`/listings/${list._id}`);
}));

// review delete

router.delete("/:reviewId",isLoggedIn,isAuthor,wrap(async (req,res)=>{
    const {id , reviewId }=req.params;
    await listing.findByIdAndUpdate(id,{ $pull: {reviews : reviewId }});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","review deleted");
    res.redirect(`/listings/${id}`);
}));

module.exports=router;