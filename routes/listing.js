const express=require("express");
const router=express.Router({mergeParams :true});
const multer  = require('multer')
const {storage}=require("../cloudcong.js");
const upload = multer({ storage});


const wrap=require("../util/wrap.js");

const listing=require("../models/listing.js");
// const user=require("../models/user.js");
const {isLoggedIn ,isOwner,validateList}=require("../middleware.js");




//index-route
router.get("/", wrap(async (req,res)=>{
   let allListings=await listing.find({});
   res.render("listings/index.ejs",{allListings});
}));

//new

router.get("/new",isLoggedIn,(req,res)=>{
    res.render("listings/newform.ejs");
});

// show route
router.get("/:id",wrap(async (req,res)=>{
    let {id}=req.params;
    const list=await listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if(!list){
        req.flash("error","listing not exist or deleted");
        res.redirect("/listings");
    }else{
     res.render("listings/show.ejs",{list});
    }
    console.log(list);
   
}));

//create route
router.post("/",isLoggedIn, upload.single("listing[image]"),validateList ,wrap(async (req,res,next)=>{
          let url =req.file.path;
          let filename=req.file.filename;

          const newListing=new listing(req.body.listing);
          newListing.owner=req.user._id;
          newListing.image={url,filename};
          await newListing.save();
          req.flash("success","new listing created");
        res.redirect("/listings");
       
 }));

//edit
router.get("/:id/edit",isLoggedIn,isOwner,wrap(async(req,res)=>{
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

router.put("/:id",isLoggedIn,isOwner,validateList,wrap(async (req,res)=>{
let {id}=req.params;
await listing.findByIdAndUpdate(id,{...req.body.listing});
req.flash("success","listing updated");
res.redirect(`/listings/${id}`);
}) );

//delete
router.delete("/:id",isLoggedIn,isOwner,wrap(async (req,res)=>{
let {id}=req.params;
let deletedlist=await listing.findByIdAndDelete(id);
console.log(deletedlist);
req.flash("success","listing deleted");
res.redirect(`/listings`);
} ));

module.exports=router;


