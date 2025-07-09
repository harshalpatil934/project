const express=require("express");
const router=express.Router({mergeParams:true});


const wrap=require("../util/wrap.js");
const {listingSchema , reviewSchema}=require("../schema.js");
const ExpressError=require("../util/ExpressError.js");
const Review=require("../models/review.js");
const listing=require("../models/listing.js");


function validateReview(req,res,next){
      let  {error} = reviewSchema.validate(req.body);
        console.log(error);
        if(error){
            let errmsg=error.details.map((el=>{el.message})).join(",");
            throw new ExpressError(400,error.message);
        }else{
            next();
        }
}

//review 

router.post("/",validateReview,wrap(async (req,res)=>{
   let list=await listing.findById(req.params.id);
   let newReview=new Review(req.body.review);

   list.reviews.push(newReview);
   await newReview.save();

   await list.save();
   console.log("new review saved");
//    res.send("new review saved");
req.flash("success","new review created");
   res.redirect(`/listings/${list._id}`);
}));

// review delete

router.delete("/:reviewId",wrap(async (req,res)=>{
    const {id , reviewId }=req.params;
    await listing.findByIdAndUpdate(id,{ $pull: {reviews : reviewId }});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","review deleted");
    res.redirect(`/listings/${id}`);
}));

module.exports=router;