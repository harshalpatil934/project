const express=require("express");
const router=express.Router({mergeParams :true});

const wrap=require("../util/wrap.js");
const {listingSchema , reviewSchema}=require("../schema.js");
const ExpressError=require("../util/ExpressError.js");
const listing=require("../models/listing.js");


function validateList(req,res,next){
      let  {error} = listingSchema.validate(req.body);
        console.log(error);
        if(error){
            let errmsg=error.details.map((el=>{el.message})).join(",");
            throw new ExpressError(400,error.message);
        }else{
            next();
        }
}

//index-route
router.get("/", wrap(async (req,res)=>{
   let allListings=await listing.find({});
   res.render("listings/index.ejs",{allListings});
}));

//new

router.get("/new",(req,res)=>{
    res.render("listings/newform.ejs");
});

// show route
router.get("/:id",wrap(async (req,res)=>{
    let {id}=req.params;
    const list=await listing.findById(id).populate("reviews");
    if(!list){
        req.flash("error","listing not exist or deleted");
        res.redirect("/listings");
    }else{
     res.render("listings/show.ejs",{list});
    }
   
}));

//create route
router.post("/",validateList ,wrap(async (req,res,next)=>{
          const newListing=new listing(req.body.listing);
          await newListing.save();
          req.flash("success","new listing created");
        res.redirect("/listings");
 }));

//edit
router.get("/:id/edit",wrap(async(req,res)=>{
    let {id}=req.params;
    const list=await listing.findById(id);
      if(!list){
        req.flash("error","listing not exist or deleted");
        res.redirect("/listings");
    }else{
     res.render("listings/editform.ejs",{list});
    }
    
}));

//update

router.put("/:id",validateList,wrap(async (req,res)=>{
let {id}=req.params;
await listing.findByIdAndUpdate(id,{...req.body.listing});
req.flash("success","listing updated");
res.redirect(`/listings/${id}`);
}) );

//delete
router.delete("/:id",wrap(async (req,res)=>{
let {id}=req.params;
let deletedlist=await listing.findByIdAndDelete(id);
console.log(deletedlist);
req.flash("success","listing deleted");
res.redirect(`/listings`);
} ));

module.exports=router;


