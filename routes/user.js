const express=require("express");
const router=express.Router();
const User=require("../models/user.js");
const wrap=require("../util/wrap.js");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const {saveUrl}=require("../middleware.js");

const Booking = require("../models/Booking.js");
const Listing = require("../models/listing.js");


router.get("/signup",(req,res)=>{
    res.render("user/signup.ejs");
});

router.post("/signup",wrap(async (req,res)=>{
    try{
         let{username,email,password}=req.body;
    const newUser=new User({email,username});
   const registerUser= await User.register(newUser,password);
   console.log(registerUser);
   req.login(registerUser,(err)=>{
    if(err){
        return next(err); 
    }
     req.flash("success","welcome to RentNRest");
   res.redirect("/listings");
   });
    }catch(err){
        req.flash("error",err.message);
        res.redirect("/user/signup.ejs");
    }
   
}));

router.get("/login",(req,res)=>{
    res.render("user/login.ejs")
});

router.post("/login",saveUrl,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),async(req,res)=>{
    req.flash("success","welcome your logged in");
    let redirectUrl=res.locals.redirectUrl||"/listings";
    res.redirect(redirectUrl);
});

router.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","you are logged out");
        res.redirect("/listings");
    });
});

router.get("/bookings/:userId", async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId }).populate("listing");
    res.render("listings/showbooking", { bookings });
  } catch (err) {
    res.status(500).send("Error fetching bookings");
  }
});


module.exports=router;