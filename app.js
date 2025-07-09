//setup
const express=require("express");
const app=express();
const path =require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./util/ExpressError.js");
const session=require("express-session");
const flash=require("connect-flash");

const listings=require("./routes/listing.js");
const reviews=require("./routes/review.js")


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.static("public"));
app.engine("ejs",ejsMate);

const mongoose=require("mongoose");
const review = require("./models/review.js");

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

app.get("/",(req,res)=>{
    res.send("recived");
});

app.use(session(sessionOption));
app.use(flash());

app.use((req,res,next)=>{
    res.locals.success =req.flash("success");
    res.locals.error =req.flash("error");
    // console.log(res.locals.success);
    next();
})

app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);


//use /:id for "*"
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
