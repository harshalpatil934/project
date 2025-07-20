//setup
if(process.env.NODE_ENV !="production"){
   require('dotenv').config(); 
}



const express=require("express");
const app=express();
const path =require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./util/ExpressError.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const listing=require("./models/listing.js");
const Booking = require("./models/Booking.js");

const wrap=require("./util/wrap.js");





const listingsRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.static("public"));
app.engine("ejs",ejsMate);

const mongoose=require("mongoose");
const review = require("./models/review.js");
const { isLoggedIn } = require('./middleware.js');

const mongo_url='mongodb://127.0.0.1:27017/RentNRest';


async function main (){
await mongoose.connect(mongo_url);
}


main().then((res)=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});


const sessionOption = {secret:"mysupercode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + 7 * 24 * 60 * 60  * 1000,
        maxAge :7 * 24 * 60 * 60  * 1000,
        httpOnly:true
    }
};

// app.get("/",(req,res)=>{
//     res.send("recived");
// });

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); //pbkdf2 hash algo


app.use((req,res,next)=>{
    res.locals.success =req.flash("success");
    res.locals.error =req.flash("error");
    res.locals.currUser=req.user;
    // console.log(res.locals.success);
    next();
})


// app.get("/demouser",async (req,res)=>{
//     let fakeuser=new User({
//         email:"student@gmail",
//         username:"abc"
//     });
//   let registeruser= await User.register(fakeuser,"helloworld");
//   res.send(registeruser);
// })

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);

app.get("/privacy",(req,res)=>{
  res.render("listings/privacy.ejs");
})

app.get("/terms",(req,res)=>{
  res.render("listings/terms.ejs");
})

app.get("/rent&rest",(req,res)=>{
  res.render("listings/rent&rest.ejs");
})
app.get("/beach",async (req,res)=>{
let allListings=await listing.find({category:"beach"});
res.render("listings/index.ejs",{allListings});
});

app.get("/forest",async (req,res)=>{
let allListings=await listing.find({category:"forest"});
res.render("listings/index.ejs",{allListings});
});

app.get("/mountain",async (req,res)=>{
let allListings=await listing.find({category:"mountain"});
res.render("listings/index.ejs",{allListings});
});

app.get("/search",async (req,res)=>{
 let {search} =req.query;
let allListings=await listing.find({country:`${search}`});
if(allListings==false){
  res.render("listings/noresponse.ejs");

}
else{
   res.render("listings/index.ejs",{allListings});
}

// console.log(search)
// res.send("hi")
});

app.delete("/cancel/:id",isLoggedIn,wrap(async (req,res)=>{
  let {id}=req.params;
  const userid=res.locals.currUser._id;
 deletedbooking= await Booking.findByIdAndDelete(id);
console.log(deletedbooking)
res.redirect(`/bookings/${userid}`);
}));

app.get("/owner/:ownerId", async (req, res) => {
  try {
    // Step 1: Find all listings owned by the host
    const listings = await listing.find({ owner: req.params.ownerId });

    // Step 2: Extract listing IDs
    const listingIds = listings.map(listing => listing._id);

    // Step 3: Find all bookings for those listings
    const bookings = await Booking.find({ listing: { $in: listingIds } }).populate("listing user");

    // Step 4: Render view
    res.render("listings/ownerbooking", { bookings });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch bookings for host.");
  }
});
    


// use /:id for "*"
app.all("/:id",(req,res,next)=>{
    next(new ExpressError(404,"page not exist"));
});

app.use((err,req,res,next)=>{
    let{statuscode =501,message="some thing went wrong"}=err;
    // res.status(statuscode).send(message);
    res.render("err.ejs",{statuscode,message});
});




app.listen(8080,()=>{
    console.log("listning");
});
