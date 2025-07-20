const express=require("express");
const router=express.Router({mergeParams :true});
const multer  = require('multer')
const {storage}=require("../cloudcong.js");
const upload = multer({ storage});


const wrap=require("../util/wrap.js");

const listing=require("../models/listing.js");
const Booking=require("../models/booking.js");
// const user=require("../models/user.js");
const {isLoggedIn ,isOwner,validateList}=require("../middleware.js");
const user=require("../models/user.js");




//index-route
router.get("/", wrap(async (req,res)=>{
   let allListings=await listing.find({});
   res.render("listings/index.ejs",{allListings});
}));

router.get("/mylistings",isLoggedIn,wrap(async(req,res)=>{
    const u=await user.findOne({username:`${res.locals.currUser.username}`});
    console.log(u);
    let allListings=await listing.find({owner:u._id});
    res.render("listings/index.ejs",{allListings});
    // res.send("reci")
    }))

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

//book
router.get("/:id/book",isLoggedIn,wrap(async(req,res)=>{
    let {id}=req.params;
    const list=await listing.findById(id);
      if(!list){
        req.flash("error","listing not exist or deleted");
        res.redirect("/listings");
    }else{
     res.render("listings/booking.ejs",{list,user:req.user});
   
    }
    
}));

//update

router.put("/:id",isLoggedIn,isOwner,upload.single("listing[image]"),validateList,wrap(async (req,res)=>{
let {id}=req.params;
let list=await listing.findByIdAndUpdate(id,{...req.body.listing});

if(typeof req.file !=="undefined"){
let url =req.file.path;
let filename=req.file.filename;
list.image={url,filename};
await list.save();
}
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

// routes/bookings.js
router.post('/:id/book', async (req, res) => {
  const { listingId, userId, checkIn, checkOut } = req.body;

  // Check if listing is already booked for selected dates
  const overlapping = await Booking.findOne({
    listing: listingId,
    $or: [
      { checkIn: { $lt: new Date(checkOut), $gte: new Date(checkIn) } },
      { checkOut: { $gt: new Date(checkIn), $lte: new Date(checkOut) } }
    ]
  });

  if (overlapping) {
    return res.status(400).json({ error: "Listing is already booked for selected dates." });
  }

  const listings = await listing.findById(listingId);
  const nights = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
  const totalPrice = nights * listings.price;
  const id=res.locals.currUser._id;

  const booking = new Booking({
    listing: listingId,
    user: userId,
    checkIn,
    checkOut,
    totalPrice,
  });

  await booking.save();
  res.redirect(`/bookings/${id}`);
  // res.status(201).json({ message: "Booking successful", booking });
});


module.exports=router;


